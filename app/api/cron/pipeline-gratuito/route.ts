/**
 * CRON — Envio para Grupo Gratuito (30 min após pipeline-radar)
 *
 * Roda às 07:30 e 19:30 (BRT) = 10:30 e 22:30 (UTC)
 *
 * Busca imóveis já enviados ao Radar mas ainda não ao grupo gratuito.
 * Isso cria a janela de antecedência que é o diferencial do Radar PB.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";

export const maxDuration = 300;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "");

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function autorizadoCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return rodarGratuito();
}

export async function POST(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return rodarGratuito();
}

async function rodarGratuito() {
  const supabase = createServiceClient();
  const log: string[] = [];
  const ts = () => new Date().toLocaleTimeString("pt-BR");

  log.push(`[${ts()}] 📢 Pipeline Gratuito iniciado`);

  // Imóveis já enviados ao Radar mas ainda NÃO ao gratuito
  const { data: pendentes } = await supabase
    .from("imoveis")
    .select("*")
    .not("enviado_radar_em", "is", null)
    .is("enviado_gratuito_em", null)
    .eq("status", "publicado")
    .order("enviado_radar_em", { ascending: true })
    .limit(5);

  if (!pendentes?.length) {
    log.push("  Nenhum imóvel pendente para grupo gratuito.");
    return NextResponse.json({ ok: true, enviados: 0, log });
  }

  log.push(`  ${pendentes.length} imóvel(is) para enviar ao grupo gratuito`);

  // Busca leads gratuitos
  const { data: leads } = await supabase
    .from("leads")
    .select("whatsapp")
    .neq("status", "inativo");

  // Filtra leads que NÃO são assinantes Radar (já receberam)
  const { data: assinantes } = await supabase
    .from("assinantes_radar")
    .select("leads(whatsapp)")
    .eq("status", "ativo");

  const numerosRadar = new Set(
    (assinantes ?? []).map((a) => (a.leads as { whatsapp: string } | null)?.whatsapp).filter(Boolean)
  );

  const numerosGratuitos = [...new Set(
    (leads ?? [])
      .map((l) => l.whatsapp)
      .filter(Boolean)
      .filter((n) => !numerosRadar.has(n)) // exclui quem já recebeu como Radar
  )];

  log.push(`  ${numerosGratuitos.length} leads gratuitos (excluindo ${numerosRadar.size} já notificados pelo Radar)`);

  let enviados = 0;

  for (const imovel of pendentes) {
    // LOCK OTIMISTA: marca antes de enviar — evita duplicata por race condition
    const { count } = await supabase
      .from("imoveis")
      .update({ enviado_gratuito_em: new Date().toISOString(), grupo_destino: "ambos" })
      .eq("id", imovel.id)
      .is("enviado_gratuito_em", null)
      .select("id", { count: "exact", head: true });

    if (!count || count === 0) {
      log.push(`  ⚠️ Imóvel já processado por outro worker: ${imovel.titulo.slice(0, 40)}`);
      continue;
    }

    log.push(`[${ts()}] 📨 Enviando ao gratuito: ${imovel.titulo.slice(0, 50)}`);

    const lance = fmt(imovel.lance_inicial);
    const cidade = `${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
    const desconto = String(imovel.desconto ?? 0);
    const data = imovel.data_leilao
      ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR")
      : "Em breve";
    const suffix = `imoveis/${imovel.id}`;

    let notificados = 0;
    let erros = 0;

    const radar = `${APP_URL}/radar`;
    const descontoNum = Number(imovel.desconto ?? 0);
    const faixaDesconto = descontoNum >= 40 ? "acima de 40%" : descontoNum >= 25 ? "entre 25% e 40%" : "abaixo de 25%";
    const tipoImovel = imovel.tipo_imovel ?? "Imóvel";
    // Link Caixa CEF (público) — só mostra se for URL da Caixa
    const editalUrl: string | null = imovel.edital_url ?? null;
    const isCaixa = editalUrl && (editalUrl.includes("caixa.gov.br") || editalUrl.includes("venda-imoveis"));
    const caixaLine = isCaixa ? `\n🏦 Caixa CEF: ${editalUrl}` : "";
    const msgGratuito = `🏠 *Novo leilão na Paraíba* [v3]\n\n${tipoImovel} em *${imovel.cidade}*${imovel.bairro ? ` — ${imovel.bairro}` : ""}\n📉 Desconto estimado: *${faixaDesconto}*\n💰 Lance a partir de *${fmt(imovel.lance_inicial ?? 0)}*${caixaLine}\n\n⭐ *Quer ver score, risco e análise completa?*\nAssine o Radar PB: ${radar}\n\n_Análise informativa. Não substitui advogado ou avaliação individual do edital._`;

    for (const numero of numerosGratuitos) {
      try {
        await sendWhatsAppMessage(numero, msgGratuito);
        notificados++;
      } catch {
        erros++;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    // (enviado_gratuito_em já foi marcado no lock otimista acima)

    enviados++;
    log.push(`  ✅ ${notificados} notificados, ${erros} erros`);

    await new Promise((r) => setTimeout(r, 2000));
  }

  log.push(`[${ts()}] ✅ Pipeline Gratuito concluído — ${enviados} imóveis`);
  return NextResponse.json({ ok: true, enviados, leads_notificados: numerosGratuitos.length, log });
}
