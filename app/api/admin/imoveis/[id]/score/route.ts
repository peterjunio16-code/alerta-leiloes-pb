import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { gerarScoreIA } from "@/lib/ai/score";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  const { data: imovel, error } = await supabase
    .from("imoveis")
    .select("id, titulo, cidade, bairro, lance_inicial, valor_avaliacao, desconto, tipo_imovel, modalidade, ocupado, data_leilao, processo_numero")
    .eq("id", params.id)
    .single();

  if (error || !imovel) {
    return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  }

  try {
    const resultado = await gerarScoreIA(imovel);

    await supabase
      .from("imoveis")
      .update({
        score: resultado.score,
        analise_ia: resultado.analise,
      })
      .eq("id", params.id);

    return NextResponse.json({
      score: resultado.score,
      analise: resultado.analise,
      resumo_whatsapp: resultado.resumo_whatsapp,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Gera score em lote para todos os imóveis pendentes sem score da IA.
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
    .limit(10); // máx 10 por vez para não estourar tokens

  if (!imoveis?.length) {
    return NextResponse.json({ message: "Nenhum imóvel sem análise IA encontrado" });
  }

  const results: { id: string; score: number; ok: boolean; erro?: string }[] = [];

  for (const imovel of imoveis) {
    try {
      const resultado = await gerarScoreIA(imovel);
      await supabase
        .from("imoveis")
        .update({ score: resultado.score, analise_ia: resultado.analise })
        .eq("id", imovel.id);
      results.push({ id: imovel.id, score: resultado.score, ok: true });
      await new Promise((r) => setTimeout(r, 1000)); // 1s entre chamadas
    } catch (err) {
      results.push({ id: imovel.id, score: 0, ok: false, erro: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ analisados: results.length, results });
}
