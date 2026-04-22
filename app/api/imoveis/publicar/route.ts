import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, sendWhatsAppImageMessage } from "@/lib/whatsapp/client";

type Grupo = "gratuito" | "radar" | "ambos";

function msgGratuito(imovel: Record<string, unknown>): string {
  const lance = (imovel.lance_inicial as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const desconto = imovel.desconto ? `${imovel.desconto}%` : "expressivo";
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "em breve";

  return `🏠 *Alerta Leilões PB*

📍 *${imovel.titulo}*
📌 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}
💰 Lance a partir de *${lance}*
📉 Desconto: *${desconto}* abaixo da avaliação
📅 Leilão: ${data}

━━━━━━━━━━━━━
Quer análise completa com score, riscos e estratégia de lance?
👉 *Radar PB:* ${process.env.NEXT_PUBLIC_APP_URL}/radar`;
}

function msgRadar(imovel: Record<string, unknown>): string {
  const lance = (imovel.lance_inicial as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const avaliacao = imovel.valor_avaliacao
    ? (imovel.valor_avaliacao as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null;
  const desconto = imovel.desconto ? `${imovel.desconto}%` : null;
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "Em breve";

  return `🎯 *RADAR PB — Oportunidade Analisada*

🏘️ *${imovel.titulo}*
📍 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}

💰 Avaliação: ${avaliacao ?? "—"}
🏷️ Lance inicial: *${lance}*
${desconto ? `📉 Desconto: *${desconto}* abaixo da avaliação\n` : ""}⭐ Score Radar: *${imovel.score ?? 0}/10*
📅 Data do leilão: ${data}

_Você recebe isso por ser assinante do Radar PB._`;
}

async function enviarParaGrupo(
  supabase: ReturnType<typeof createServiceClient>,
  imovel: Record<string, unknown>,
  grupo: Grupo
): Promise<number> {
  const numeros = new Set<string>();

  // Grupo gratuito → todos os leads não-inativos
  if (grupo === "gratuito" || grupo === "ambos") {
    const { data: leads } = await supabase
      .from("leads")
      .select("whatsapp")
      .neq("status", "inativo");
    leads?.forEach((l) => numeros.add(l.whatsapp));
  }

  // Grupo radar → assinantes ativos (via join com leads para pegar whatsapp)
  if (grupo === "radar" || grupo === "ambos") {
    const { data: assinantes } = await supabase
      .from("assinantes_radar")
      .select("lead_id, leads(whatsapp)")
      .eq("status", "ativo");
    assinantes?.forEach((a) => {
      const lead = a.leads as { whatsapp: string } | null;
      if (lead?.whatsapp) numeros.add(lead.whatsapp);
    });
  }

  const lista = Array.from(numeros);
  const mensagemGratuito = msgGratuito(imovel);
  const mensagemRadar = msgRadar(imovel);

  // Para "ambos", assinantes radar recebem mensagem premium
  let assinantesRadarNums = new Set<string>();
  if (grupo === "ambos") {
    const { data: assinantes } = await supabase
      .from("assinantes_radar")
      .select("lead_id, leads(whatsapp)")
      .eq("status", "ativo");
    assinantes?.forEach((a) => {
      const lead = a.leads as { whatsapp: string } | null;
      if (lead?.whatsapp) assinantesRadarNums.add(lead.whatsapp);
    });
  }

  let notificados = 0;
  for (const numero of lista) {
    let msg: string;
    if (grupo === "radar") {
      msg = mensagemRadar;
    } else if (grupo === "ambos" && assinantesRadarNums.has(numero)) {
      msg = mensagemRadar;
    } else {
      msg = mensagemGratuito;
    }

    const imagemUrl = imovel.imagem_url as string | null;
    if (imagemUrl) {
      await sendWhatsAppImageMessage(numero, imagemUrl, msg);
    } else {
      await sendWhatsAppMessage(numero, msg);
    }
    notificados++;
    await new Promise((r) => setTimeout(r, 500));
  }

  return notificados;
}

export async function POST(request: NextRequest) {
  try {
    const { imovelId, grupo = "gratuito" }: { imovelId: string; grupo: Grupo } =
      await request.json();

    const supabase = createServiceClient();

    const { data: imovel, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", imovelId)
      .single();

    if (error || !imovel) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Atualiza status e grupo_destino
    await supabase
      .from("imoveis")
      .update({ status: "publicado", grupo_destino: grupo })
      .eq("id", imovelId);

    const notificados = await enviarParaGrupo(supabase, imovel as Record<string, unknown>, grupo);

    return NextResponse.json({ success: true, notificados, grupo });
  } catch (err) {
    console.error("Error publishing imóvel:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
