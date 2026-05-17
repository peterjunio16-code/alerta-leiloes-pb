import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";

type Grupo = "gratuito" | "radar" | "ambos";

// Remove espaços e barra final do URL (evita URL quebrada como "vercel.app/ /radar")
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "");

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

/**
 * Retorna o suffix dinâmico para o botão URL do WhatsApp.
 * O template tem base URL: https://alerta-leiloes-pb.vercel.app/
 * então o suffix é: imoveis/<id>
 */
function imovelSuffix(imovel: Record<string, unknown>): string {
  return `imoveis/${imovel.id as string}`;
}

function paramsGratuito(imovel: Record<string, unknown>): { body: string[]; urlSuffix: string } {
  const lance = fmt((imovel.lance_inicial as number) ?? 0);
  const cidade = `${imovel.cidade ?? "PB"}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
  const desconto = String(imovel.desconto ?? 0);
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "Em breve";
  return {
    body: [String(imovel.titulo ?? "Imóvel em leilão"), cidade, lance, desconto, data],
    urlSuffix: imovelSuffix(imovel),
  };
}

function paramsRadar(imovel: Record<string, unknown>): { body: string[]; urlSuffix: string } {
  const lance = fmt((imovel.lance_inicial as number) ?? 0);
  const avaliacao = imovel.valor_avaliacao ? fmt(imovel.valor_avaliacao as number) : "—";
  const cidade = `${imovel.cidade ?? "PB"}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
  const desconto = String(imovel.desconto ?? 0);
  const score = String(imovel.score ?? 0);
  const data = imovel.data_leilao
    ? new Date(imovel.data_leilao as string).toLocaleDateString("pt-BR")
    : "Em breve";
  return {
    body: [String(imovel.titulo ?? "Imóvel em leilão"), cidade, avaliacao, lance, desconto, score, data],
    urlSuffix: imovelSuffix(imovel),
  };
}

// Fallback em texto livre — usa SEMPRE a URL interna do app (nunca link externo que exige login)
function msgTextoGratuito(imovel: Record<string, unknown>): string {
  const p = paramsGratuito(imovel);
  const tipoImovel = (imovel.tipo_imovel as string) ?? "Imóvel";
  const cidade = `${imovel.cidade ?? "PB"}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
  const descontoNum = Number(imovel.desconto ?? 0);
  const faixaDesconto = descontoNum >= 40 ? "acima de 40%" : descontoNum >= 25 ? "entre 25% e 40%" : "abaixo de 25%";
  const radar = `${APP_URL}/radar`;
  // Mostra link da Caixa CEF se disponível (URL pública, não exige login)
  const editalUrl = (imovel.edital_url as string | null);
  const isCaixa = editalUrl && (editalUrl.includes("caixa.gov.br") || editalUrl.includes("venda-imoveis"));
  const caixaLine = isCaixa ? `\n🏦 Caixa CEF: ${editalUrl}` : "";
  return `🏠 *Novo leilão na Paraíba* [v3]\n\n${tipoImovel} em *${cidade}*\n📉 Desconto estimado: *${faixaDesconto}*\n💰 Lance a partir de *${p.body[2]}*\n📅 Leilão: ${p.body[4]}${caixaLine}\n\n⭐ *Quer ver score, risco e análise completa?*\nAssine o Radar PB: ${radar}\n\n_Análise informativa. Não substitui advogado ou avaliação individual do edital._`;
}

function msgTextoRadar(imovel: Record<string, unknown>): string {
  const p = paramsRadar(imovel);
  const link = `${APP_URL}/imoveis/${imovel.id as string}`;
  // Filtra URLs do LeilaoNinja (exigem login — inúteis para o lead)
  const editalPublico = (imovel.edital_url as string | null);
  const editalValido = editalPublico && !editalPublico.includes("leilaoninja.com") ? editalPublico : null;
  const leiloeiroLine = editalValido ? `\n🏛️ Leiloeiro: ${editalValido}` : "";
  return `🔐 *RADAR PB — EXCLUSIVO*\n\n⭐ Score: ${p.body[5]}/10\n\n🏠 *${p.body[0]}*\n📍 ${p.body[1]}\n\n💰 Avaliação: ${p.body[2]}\n⚡ Lance mín: ${p.body[3]}\n📉 ${p.body[4]}%\n📅 ${p.body[6]}\n\n🔗 ${link}${leiloeiroLine}\n\n_Você recebe antes do grupo gratuito por ser assinante Radar PB_`;
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
        const p = paramsRadar(imovel);
        try {
          await sendWhatsAppTemplate(numero, "alerta_imovel_radar", "pt_BR", p.body, [p.urlSuffix]);
        } catch {
          await sendWhatsAppMessage(numero, msgTextoRadar(imovel));
        }
      } else {
        const p = paramsGratuito(imovel);
        try {
          // Gratuito tem 2 botões: btn 0 dinâmico (imóvel), btn 1 estático (radar) — só o 0 precisa de param
          await sendWhatsAppTemplate(numero, "alerta_imovel_gratuito", "pt_BR", p.body, [p.urlSuffix]);
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

    const agora = new Date().toISOString();

    // LOCK EXPLÍCITO — checa primeiro o estado atual do imóvel, depois atualiza.
    // (Versão anterior usava .update().is(null) que se comportou de forma errada com Supabase)
    const imovelData = imovel as { enviado_radar_em: string | null; enviado_gratuito_em: string | null };

    const radarJaEnviado = !!imovelData.enviado_radar_em;
    const gratuitoJaEnviado = !!imovelData.enviado_gratuito_em;

    let bloqueado = false;
    if (grupo === "radar" && radarJaEnviado) bloqueado = true;
    if (grupo === "gratuito" && gratuitoJaEnviado) bloqueado = true;
    if (grupo === "ambos" && (radarJaEnviado || gratuitoJaEnviado)) bloqueado = true;

    if (bloqueado) {
      return NextResponse.json({
        success: false,
        error: "Imóvel já foi publicado para este grupo. Ignorado para evitar duplicata.",
        notificados: 0,
        leads_encontrados: 0,
        erros: [],
        grupo,
      }, { status: 409 });
    }

    // Constrói o update e aplica
    const update: Record<string, string> = { status: "publicado", grupo_destino: grupo };
    if (grupo === "radar" || grupo === "ambos") update.enviado_radar_em = agora;
    if (grupo === "gratuito" || grupo === "ambos") update.enviado_gratuito_em = agora;

    const { error: updateError } = await supabase
      .from("imoveis")
      .update(update)
      .eq("id", imovelId);

    if (updateError) {
      console.error("Erro ao atualizar imóvel:", updateError);
      return NextResponse.json({
        success: false,
        error: "Erro ao marcar imóvel como publicado",
        detalhe: updateError.message,
      }, { status: 500 });
    }

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
