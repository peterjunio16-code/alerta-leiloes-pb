/**
 * CRON — Pipeline automático: Garimpagem → Score IA → Envio Radar PB
 *
 * Roda às 07:00 e 19:00 (BRT) = 10:00 e 22:00 (UTC)
 *
 * Fluxo:
 *  1. Scrape Caixa CEF + LeilãoImóvel PB
 *  2. Score IA (Claude) nos imóveis novos
 *  3. Filtra score >= SCORE_MINIMO (padrão: 5)
 *  4. Envia para assinantes Radar PB (pagos) via template WhatsApp
 *  5. Marca `enviado_radar_em` no banco
 *
 * 30 minutos depois, /api/cron/pipeline-gratuito envia para leads gratuitos.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { scrapeCaixaCEF } from "@/lib/scraper/caixa-cef";
import { scrapeLeilaoImovelPB } from "@/lib/scraper/leilao-imovel-api";
import { gerarScoreIA } from "@/lib/ai/score";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";

export const maxDuration = 300;

const SCORE_MINIMO = Number(process.env.PIPELINE_SCORE_MINIMO ?? "5");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function autorizadoCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sem secret no env, permite (dev local)
  // Aceita via header OU via query param ?secret=...
  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function POST(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return rodarPipeline();
}

// Vercel Cron usa GET
export async function GET(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return rodarPipeline();
}

async function rodarPipeline() {
  const supabase = createServiceClient();
  const log: string[] = [];
  const ts = () => new Date().toLocaleTimeString("pt-BR");

  log.push(`[${ts()}] 🚀 Pipeline Radar PB iniciado`);

  // ── 1. Garimpagem ────────────────────────────────────────────────
  log.push(`[${ts()}] 🔍 Scraping Caixa CEF...`);
  let scrapeOk = false;
  try {
    const caixaResult = await scrapeCaixaCEF(5);
    log.push(`  Caixa: ${caixaResult.saved} novos, ${caixaResult.skipped} duplicados`);
    scrapeOk = true;
  } catch (err) {
    log.push(`  Caixa ERROR: ${err instanceof Error ? err.message : String(err)}`);
  }

  log.push(`[${ts()}] 🔍 Scraping LeilãoImóvel...`);
  try {
    const liResult = await scrapeLeilaoImovelPB(3);
    log.push(`  LeilãoImóvel: ${liResult.saved} novos, ${liResult.skipped} duplicados`);
    scrapeOk = true;
  } catch (err) {
    log.push(`  LeilãoImóvel ERROR: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!scrapeOk) {
    return NextResponse.json({ ok: false, log }, { status: 500 });
  }

  // ── 2. Score IA nos imóveis novos sem análise ────────────────────
  log.push(`[${ts()}] 🤖 Gerando scores IA...`);
  const { data: semScore } = await supabase
    .from("imoveis")
    .select("id, titulo, cidade, bairro, lance_inicial, valor_avaliacao, desconto, tipo_imovel, modalidade, ocupado, data_leilao, processo_numero")
    .eq("status", "pendente")
    .is("analise_ia", null)
    .order("created_at", { ascending: false })
    .limit(15);

  let scorados = 0;
  for (const imovel of semScore ?? []) {
    try {
      const resultado = await gerarScoreIA(imovel);
      await supabase
        .from("imoveis")
        .update({ score: resultado.score, analise_ia: resultado.analise })
        .eq("id", imovel.id);
      scorados++;
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      log.push(`  Score ERROR ${imovel.titulo.slice(0, 30)}: ${err instanceof Error ? err.message.slice(0, 80) : String(err)}`);
    }
  }
  log.push(`  ${scorados} imóveis analisados pela IA`);

  // ── 3. Busca imóveis aprovados para enviar ao Radar ──────────────
  log.push(`[${ts()}] 📤 Buscando imóveis para Radar PB (score >= ${SCORE_MINIMO})...`);
  const { data: candidatos } = await supabase
    .from("imoveis")
    .select("*")
    .eq("status", "pendente")
    .is("enviado_radar_em", null)
    .gte("score", SCORE_MINIMO)
    .order("score", { ascending: false })
    .limit(5); // máx 5 por rodada para não spammar

  if (!candidatos?.length) {
    log.push("  Nenhum imóvel novo para enviar.");
    return NextResponse.json({ ok: true, enviados: 0, log });
  }

  log.push(`  ${candidatos.length} imóveis candidatos para envio`);

  // ── 4. Busca assinantes Radar PB ─────────────────────────────────
  const { data: assinantes } = await supabase
    .from("assinantes_radar")
    .select("lead_id, leads(whatsapp)")
    .eq("status", "ativo");

  const numerosRadar = (assinantes ?? [])
    .map((a) => (a.leads as { whatsapp: string } | null)?.whatsapp)
    .filter(Boolean) as string[];

  log.push(`  ${numerosRadar.length} assinantes Radar PB ativos`);

  // ── 5. Envia para cada imóvel ────────────────────────────────────
  let enviados = 0;
  for (const imovel of candidatos) {
    log.push(`[${ts()}] 📨 Enviando: ${imovel.titulo.slice(0, 50)} (score ${imovel.score})`);

    const lance = fmt(imovel.lance_inicial);
    const avaliacao = imovel.valor_avaliacao ? fmt(imovel.valor_avaliacao) : "—";
    const cidade = `${imovel.cidade}${imovel.bairro ? ` — ${imovel.bairro}` : ""}`;
    const desconto = String(imovel.desconto ?? 0);
    const score = String(imovel.score ?? 0);
    const data = imovel.data_leilao
      ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR")
      : "Em breve";
    const suffix = `imoveis/${imovel.id}`;

    let notificados = 0;
    let erros = 0;

    for (const numero of numerosRadar) {
      try {
        try {
          await sendWhatsAppTemplate(
            numero, "alerta_imovel_radar", "pt_BR",
            [String(imovel.titulo), cidade, avaliacao, lance, desconto, score, data],
            [suffix]
          );
        } catch {
          // Fallback texto livre
          const link = `${APP_URL}/imoveis/${imovel.id}`;
          await sendWhatsAppMessage(numero,
            `🔐 *RADAR PB — EXCLUSIVO*\n\n⭐ Score: ${score}/10\n\n🏠 *${imovel.titulo}*\n📍 ${cidade}\n\n💰 Avaliação: ${avaliacao}\n⚡ Lance mín: ${lance}\n📉 ${desconto}%\n📅 ${data}\n\n🔗 ${link}\n\n_Você recebe antes do grupo gratuito por ser assinante Radar PB_`
          );
        }
        notificados++;
      } catch {
        erros++;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    // Marca como enviado ao Radar
    await supabase
      .from("imoveis")
      .update({
        enviado_radar_em: new Date().toISOString(),
        status: "publicado",
        grupo_destino: "radar",
      })
      .eq("id", imovel.id);

    enviados++;
    log.push(`  ✅ ${notificados} notificados, ${erros} erros`);

    // Pausa entre imóveis
    await new Promise((r) => setTimeout(r, 2000));
  }

  log.push(`[${ts()}] ✅ Pipeline Radar concluído — ${enviados} imóveis enviados`);
  log.push(`  ⏰ Grupo gratuito será notificado em 30 min via pipeline-gratuito`);

  return NextResponse.json({ ok: true, enviados, assinantes_radar: numerosRadar.length, log });
}
