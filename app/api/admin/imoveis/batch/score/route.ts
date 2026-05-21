import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { gerarScoreIA } from "@/lib/ai/score";

export const maxDuration = 300;

/**
 * PUT /api/admin/imoveis/batch/score
 * Gera score IA em lote para imóveis pendentes sem análise.
 */
export async function PUT(_request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  // Verifica quantos existem no total (pra dar feedback claro)
  const { count: totalPendentes } = await supabase
    .from("imoveis")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente");

  const { count: jaAnalisados } = await supabase
    .from("imoveis")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente")
    .not("analise_ia", "is", null);

  // Limita a 25 por rodada (5 min de timeout / ~12s por imóvel = ~25 com folga)
  const { data: imoveis } = await supabase
    .from("imoveis")
    .select("id, titulo, cidade, bairro, lance_inicial, valor_avaliacao, desconto, tipo_imovel, modalidade, ocupado, data_leilao, processo_numero")
    .eq("status", "pendente")
    .is("analise_ia", null)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!imoveis?.length) {
    return NextResponse.json({
      message: totalPendentes === jaAnalisados
        ? `Todos os ${totalPendentes} imóveis pendentes já têm análise IA.`
        : "Nenhum imóvel pendente sem análise IA",
      analisados: 0,
      total_pendentes: totalPendentes ?? 0,
      ja_analisados: jaAnalisados ?? 0,
    });
  }

  const results: { id: string; titulo: string; score: number; ok: boolean; erro?: string }[] = [];

  for (const imovel of imoveis) {
    try {
      const resultado = await gerarScoreIA(imovel);
      await supabase
        .from("imoveis")
        .update({ score: resultado.score, analise_ia: resultado.analise })
        .eq("id", imovel.id);
      results.push({ id: imovel.id, titulo: imovel.titulo, score: resultado.score, ok: true });
    } catch (err) {
      results.push({
        id: imovel.id,
        titulo: imovel.titulo,
        score: 0,
        ok: false,
        erro: err instanceof Error ? err.message.slice(0, 100) : String(err),
      });
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  const sucessos = results.filter((r) => r.ok).length;
  const falhas = results.filter((r) => !r.ok).length;
  const restantes = (totalPendentes ?? 0) - (jaAnalisados ?? 0) - sucessos;

  return NextResponse.json({
    analisados: sucessos,
    falhas,
    restantes,
    total_pendentes: totalPendentes ?? 0,
    message: restantes > 0
      ? `${sucessos} analisados nesta rodada. Ainda restam ${restantes} sem análise — clique novamente para continuar.`
      : `Todos os ${totalPendentes} imóveis foram analisados.`,
    results,
  });
}
