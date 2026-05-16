/**
 * CRON — Score de Engajamento para Mentoria
 *
 * Calcula score_mentoria (0–100) para cada lead ativo.
 * Roda uma vez por dia (ex.: 09:00 BRT = 12:00 UTC).
 *
 * Critérios de pontuação:
 *  +10  Tem nome cadastrado (não só telefone)
 *  +15  Ativo há 7+ dias
 *  +10  Ativo há 14+ dias (acumulativo)
 *  +10  Ativo há 30+ dias (acumulativo)
 *  +15  Sequência gratuita 100% entregue (todos os 4 dias enviados)
 *  +30  É assinante Radar PB ativo (já converteu uma vez)
 *  +10  Applied para mentoria (mostrou intenção)
 *  Total máximo: 100
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

function autorizadoCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authHeader = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

async function calcularScores(): Promise<NextResponse> {
  const supabase = createServiceClient();
  const now = new Date();
  const log: string[] = [];

  // Busca todos os leads ativos
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, nome, created_at, status")
    .neq("status", "inativo");

  if (error || !leads) {
    return NextResponse.json({ error: "Failed to fetch leads", detail: error }, { status: 500 });
  }

  log.push(`Processando ${leads.length} leads...`);

  // Busca assinantes Radar ativos (lead_id → Set para lookup O(1))
  const { data: assinantes } = await supabase
    .from("assinantes_radar")
    .select("lead_id")
    .eq("status", "ativo");

  const radarSet = new Set((assinantes ?? []).map((a) => a.lead_id).filter(Boolean));

  // Busca aplicações à mentoria
  const { data: aplicacoes } = await supabase
    .from("aplicacoes_mentoria")
    .select("lead_id");

  const mentoriaSet = new Set((aplicacoes ?? []).map((a) => a.lead_id).filter(Boolean));

  // Busca sequências gratuitas já enviadas (agrupa por lead_id)
  const { data: seqs } = await supabase
    .from("sequencias_nutricao")
    .select("lead_id, dia, enviado")
    .eq("tipo", "gratuito")
    .eq("enviado", true);

  // Conta quantos dias cada lead completou
  const seqCount: Record<string, number> = {};
  for (const s of seqs ?? []) {
    if (!s.lead_id) continue;
    seqCount[s.lead_id] = (seqCount[s.lead_id] ?? 0) + 1;
  }

  let updated = 0;

  for (const lead of leads) {
    let score = 0;

    // +10 tem nome
    if (lead.nome && lead.nome.trim().length > 1) score += 10;

    // Tempo de vida do lead
    const diasAtivo = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 86_400_000);
    if (diasAtivo >= 7)  score += 15;
    if (diasAtivo >= 14) score += 10;
    if (diasAtivo >= 30) score += 10;

    // +15 completou toda a régua gratuita (4 mensagens)
    const completou = (seqCount[lead.id] ?? 0) >= 4;
    if (completou) score += 15;

    // +30 é assinante Radar ativo
    if (radarSet.has(lead.id)) score += 30;

    // +10 já aplicou para mentoria
    if (mentoriaSet.has(lead.id)) score += 10;

    // Garante [0, 100]
    score = Math.min(100, Math.max(0, score));

    await supabase
      .from("leads")
      .update({ score_mentoria: score, score_mentoria_em: now.toISOString() })
      .eq("id", lead.id);

    updated++;
    await new Promise((r) => setTimeout(r, 30)); // throttle suave
  }

  log.push(`✅ ${updated} leads atualizados`);

  return NextResponse.json({ success: true, updated, log });
}

export async function GET(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return calcularScores();
}

export async function POST(request: NextRequest) {
  if (!autorizadoCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return calcularScores();
}
