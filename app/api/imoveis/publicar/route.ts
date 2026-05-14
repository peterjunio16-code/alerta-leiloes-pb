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

  const linkImovel = imovel.link as string | null;

  return `🏠 *Alerta Leilões PB*

📍 *${imovel.titulo}*
📌 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}
💰 Lance a partir de *${lance}*
📉 Desconto: *${desconto}* abaixo da avaliação
📅 Leilão: ${data}
${linkImovel ? `\n🔗 Ver imóvel: ${linkImovel}` : ""}
━━━━━━━━━━━━━
Quer análise completa com score, riscos e estratégia de lance?
👉 *Assine o Radar PB:* ${process.env.NEXT_PUBLIC_APP_URL}/radar`;
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

  const linkImovelRadar = imovel.link as string | null;

  return `🎯 *RADAR PB — Oportunidade Analisada*

🏘️ *${imovel.titulo}*
📍 ${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}

💰 Avaliação: ${avaliacao ?? "—"}
🏷️ Lance inicial: *${lance}*
${desconto ? `📉 Desconto: *${desconto}* abaixo da avaliação\n` : ""}⭐ Score Radar: *${imovel.score ?? 0}/10*
📅 Data do leilão: ${data}
${linkImovelRadar ? `\n🔗 Ver imóvel completo: ${linkImovelRadar}` : ""}
_Você recebe isso por ser assinante do Radar PB._`;
}

type EnvioResult = {
  notificados: number;
  leads_encontrados: number;
  erros: string[];
};

async function enviarParaGrupo(
  supabase: ReturnType<typeof createServiceClient>,
  imovel: Record<string, unknown>,
  grupo: Grupo
): Promise<EnvioResult> {
  const numeros = new Set<string>();

  // Grupo gratuito → todos os leads não-inativos
  if (grupo === "gratuito" || grupo === "ambos") {
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("whatsapp")
      .neq("status", "inativo");
    if (leadsError) console.error("Erro ao buscar leads:", leadsError.message);
    leads?.forEach((l) => { if (l.whatsapp) numeros.add(l.whatsapp); });
  }

  // Grupo radar → assinantes ativos (via join com leads para pegar whatsapp)
  if (grupo === "radar" || grupo === "ambos") {
    const { data: assinantes, error: asinError } = await supabase
      .from("assinantes_radar")
      .select("lead_id, leads(whatsapp)")
      .eq("status", "ativo");
    if (asinError) console.error("Erro ao buscar assinantes:", asinError.message);
    assinantes?.forEach((a) => {
      const lead = a.leads as { whatsapp: string } | null;
      if (lead?.whatsapp) numeros.add(lead.whatsapp);
    });
  }

  const lista = Array.from(numeros);
  const leads_encontrados = lista.length;
  const mensagemGratuito = msgGratuito(imovel);
  const mensagemRadar = msgRadar(imovel);

  // Para "ambos", assinantes radar recebem mensagem premium
  const assinantesRadarNums = new Set<string>();
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
  const erros: string[] = [];

  for (const numero of lista) {
    let msg: string;
    if (grupo === "radar") {
      msg = mensagemRadar;
    } else if (grupo === "ambos" && assinantesRadarNums.has(numero)) {
      msg = mensagemRadar;
    } else {
      msg = mensagemGratuito;
    }

    try {
      const imagemUrl = imovel.imagem_url as string | null;
      if (imagemUrl) {
        await sendWhatsAppImageMessage(numero, imagemUrl, msg);
      } else {
        await sendWhatsAppMessage(numero, msg);
      }
      notificados++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Falha ao enviar para ${numero}:`, errMsg);
      erros.push(`${numero}: ${errMsg.slice(0, 120)}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  return { notificados, leads_encontrados, erros };
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

    const resultado = await enviarParaGrupo(supabase, imovel as Record<string, unknown>, grupo);

    return NextResponse.json({
      success: true,
      notificados: resultado.notificados,
      leads_encontrados: resultado.leads_encontrados,
      erros: resultado.erros,
      grupo,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Error publishing imóvel:", errMsg);
    return NextResponse.json({ error: "Erro interno", detalhe: errMsg }, { status: 500 });
  }
}
