/**
 * CRON — Nutrição (Gratuito D+1/3/7/14) + Onboarding Radar (D+1/3/7/30)
 *
 * Roda uma vez por dia (ex.: 08:00 BRT = 11:00 UTC).
 * Processar ambos os tipos de sequência em uma única execução.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppTemplate, sendWhatsAppMessage } from "@/lib/whatsapp/client";
import type { Database } from "@/lib/supabase/types";
import {
  getSequenciaD1,
  getSequenciaD3,
  getSequenciaD7,
  getSequenciaD14,
  getRadarOnboardingD1,
  getRadarOnboardingD3,
  getRadarOnboardingD7,
  getRadarOnboardingD30,
} from "@/lib/whatsapp/messages";

type SeqRow = Database["public"]["Tables"]["sequencias_nutricao"]["Row"] & {
  leads: { nome: string | null; whatsapp: string } | null;
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alerta-leiloes-pb.vercel.app").trim().replace(/\/$/, "");

// ── Gratuito: template name + params por dia ──────────────────────────────────
const GRATUITO_TEMPLATE: Record<number, (nome: string) => { name: string; params: string[] }> = {
  1:  (nome) => ({ name: "nutricao_leiloes_d1",  params: [nome] }),
  3:  (nome) => ({ name: "nutricao_leiloes_d3",  params: [nome, `${APP_URL}/radar`] }),
  7:  (nome) => ({ name: "nutricao_leiloes_d7",  params: [nome, `${APP_URL}/radar`] }),
  14: (nome) => ({ name: "nutricao_leiloes_d14", params: [nome, `${APP_URL}/radar`] }),
};

const GRATUITO_FALLBACK: Record<number, (nome: string) => string> = {
  1:  getSequenciaD1,
  3:  getSequenciaD3,
  7:  getSequenciaD7,
  14: getSequenciaD14,
};

// ── Radar: template name + params por dia ────────────────────────────────────
const RADAR_TEMPLATE: Record<number, (nome: string) => { name: string; params: string[] }> = {
  1:  (nome) => ({ name: "radar_onboarding_d1", params: [nome] }),
  3:  (nome) => ({ name: "radar_onboarding_d3", params: [nome] }),
  7:  (nome) => ({ name: "radar_onboarding_d7", params: [nome, `${APP_URL}/mentoria`] }),
  30: (nome) => ({ name: "radar_onboarding_d30", params: [nome, `${APP_URL}/mentoria`] }),
};

const RADAR_FALLBACK: Record<number, (nome: string) => string> = {
  1:  getRadarOnboardingD1,
  3:  getRadarOnboardingD3,
  7:  getRadarOnboardingD7,
  30: getRadarOnboardingD30,
};

function autorizadoCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

async function processarSequencias(
  tipo: "gratuito" | "radar",
  dias: number[],
  templateMap: Record<number, (nome: string) => { name: string; params: string[] }>,
  fallbackMap: Record<number, (nome: string) => string>,
): Promise<{ processed: number; errors: number }> {
  const supabase = createServiceClient();
  const now = new Date();
  let processed = 0;
  let errors = 0;

  for (const dia of dias) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - dia);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data: sequences } = await supabase
      .from("sequencias_nutricao")
      .select("*, leads(nome, whatsapp)")
      .eq("tipo", tipo)
      .eq("dia", dia)
      .eq("enviado", false)
      .lte("created_at", `${cutoffStr}T23:59:59Z`)
      .limit(50) as { data: SeqRow[] | null };

    if (!sequences?.length) continue;

    for (const seq of sequences) {
      const lead = seq.leads;
      if (!lead) continue;

      const nome = lead.nome ?? "Investidor";
      const templateFn = templateMap[dia];
      const fallbackFn = fallbackMap[dia];
      if (!templateFn) continue;

      const { name, params } = templateFn(nome);

      try {
        try {
          await sendWhatsAppTemplate(lead.whatsapp, name, "pt_BR", params);
        } catch {
          // Fallback texto livre (só entrega dentro da janela de 24h)
          await sendWhatsAppMessage(lead.whatsapp, fallbackFn(nome));
        }

        await supabase
          .from("sequencias_nutricao")
          .update({ enviado: true, enviado_em: now.toISOString() })
          .eq("id", seq.id);
        processed++;
      } catch (err) {
        console.error(`[nutricao] Failed D+${dia} ${tipo} → ${lead.whatsapp}:`, err);
        errors++;
      }

      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return { processed, errors };
}

export async function GET(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [gratuito, radar] = await Promise.all([
    processarSequencias("gratuito", [1, 3, 7, 14], GRATUITO_TEMPLATE, GRATUITO_FALLBACK),
    processarSequencias("radar",    [1, 3, 7, 30], RADAR_TEMPLATE,    RADAR_FALLBACK),
  ]);

  return NextResponse.json({
    success: true,
    gratuito,
    radar,
    total_processed: gratuito.processed + radar.processed,
    total_errors: gratuito.errors + radar.errors,
  });
}

// Vercel Cron usa GET, mas aceita POST para testes manuais
export async function POST(request: NextRequest) {
  return GET(request);
}
