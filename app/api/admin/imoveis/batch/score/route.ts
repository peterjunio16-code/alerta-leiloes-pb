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

  const { data: imoveis } = await supabase
    .from("imoveis")
    .select("id, titulo, cidade, bairro, lance_inicial, valor_avaliacao, desconto, tipo_imovel, modalidade, ocupado, data_leilao, processo_numero")
    .eq("status", "pendente")
    .is("analise_ia", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!imoveis?.length) {
    return NextResponse.json({ message: "Nenhum imóvel pendente sem análise IA", analisados: 0 });
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

  return NextResponse.json({ analisados: results.length, results });
}
