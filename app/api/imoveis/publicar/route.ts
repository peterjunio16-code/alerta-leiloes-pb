import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";

type Grupo = "gratuito" | "radar" | "ambos";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function paramsGratuito(imovel: Record<string, unknown>): string[] {
  const lance = fmt((imovel.lance_inicial as number) ?? 0);
  const cidade = `${imovel.cidade ?? "PB"}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
  const desconto = String(imovel.desconto ?? 0);
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "Em breve";
  const link = (imovel.link as string) ?? `${process.env.NEXT_PUBLIC_APP_URL}/grupo`;
  const urlRadar = `${process.env.NEXT_PUBLIC_APP_URL}/radar`;
  return [String(imovel.titulo ?? "Imóvel em leilão"), cidade, lance, desconto, data, link, urlRadar];
}

function paramsRadar(imovel: Record<string, unknown>): string[] {
  const lance = fmt((imovel.lance_inicial as number) ?? 0);
  const avaliacao = imovel.valor_avaliacao ? fmt(imovel.valor_avaliacao as number) : "—";
  const cidade = `${imovel.cidade ?? "PB"}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
  const desconto = String(imovel.desconto ?? 0);
  const score = String(imovel.score ?? 0);
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "Em breve";
  const link = (imovel.link as string) ?? `${process.env.NEXT_PUBLIC_APP_URL}/radar`;
  return [String(imovel.titulo ?? "Imóvel em leilão"), cidade, avaliacao, lance, desconto, score, data, link];
}

// Fallback em texto livre (funciona apenas dentro da janela de 24h)
function msgTextoGratuito(imovel: Record<string, unknown>): string {
  const params = paramsGratuito(imovel);
  return `🏠 *Alerta Leilões PB*\n\n📍 *${params[0]}*\n📌 ${params[1]}\n💰 Lance a partir de *${params[2]}*\n📉 Desconto: *${params[3]}%*\n📅 Leilão: ${params[4]}\n🔗 ${params[5]}\n\n━━━━━━━━━\nAnálise completa: ${params[6]}`;
}

function msgTextoRadar(imovel: Record<string, unknown>): string {
  const params = paramsRadar(imovel);
  return `🎯 *RADAR PB*\n\n🏘️ *${params[0]}*\n📍 ${params[1]}\n💰 Avaliação: ${params[2]} → Lance: *${params[3]}*\n📉 ${params[4]}% | ⭐ Score: *${params[5]}/10*\n📅 ${params[6]}\n🔗 ${params[7]}`;
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

  if (grupo === "gratuito" || grupo === "ambos") {
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("whatsapp")
      .neq("status", "inativo");
    if (leadsError) console.error("Erro ao buscar leads:", leadsError.message);
    leads?.forEach((l) => { if (l.whatsapp) numeros.add(l.whatsapp); });
  }

  const assinantesRadarNums = new Set<string>();
  if (grupo === "radar" || grupo === "ambos") {
    const { data: assinantes, error: asinError } = await supabase
      .from("assinantes_radar")
      .select("lead_id, leads(whatsapp)")
      .eq("status", "ativo");
    if (asinError) console.error("Erro ao buscar assinantes:", asinError.message);
    assinantes?.forEach((a) => {
      const lead = a.leads as { whatsapp: string } | null;
      if (lead?.whatsapp) {
        numeros.add(lead.whatsapp);
        assinantesRadarNums.add(lead.whatsapp);
      }
    });
  }

  const lista = Array.from(numeros);
  const leads_encontrados = lista.length;
  let notificados = 0;
  const erros: string[] = [];

  for (const numero of lista) {
    const isRadar = grupo === "radar" || (grupo === "ambos" && assinantesRadarNums.has(numero));

    try {
      if (isRadar) {
        // Tenta template primeiro, fallback para texto
        try {
          await sendWhatsAppTemplate(numero, "alerta_imovel_radar", "pt_BR", paramsRadar(imovel));
        } catch {
          await sendWhatsAppMessage(numero, msgTextoRadar(imovel));
        }
      } else {
        try {
          await sendWhatsAppTemplate(numero, "alerta_imovel_gratuito", "pt_BR", paramsGratuito(imovel));
        } catch {
          await sendWhatsAppMessage(numero, msgTextoGratuito(imovel));
        }
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
