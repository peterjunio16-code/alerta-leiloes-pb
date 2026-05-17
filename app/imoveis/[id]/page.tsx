import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: { id: string }; searchParams?: { ref?: string } };

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("imoveis").select("titulo, cidade, bairro, desconto").eq("id", params.id).single();
  if (!data) return { title: "Imóvel não encontrado" };
  const desc = `Imóvel em leilão em ${data.cidade}${data.bairro ? ` — ${data.bairro}` : ""}${data.desconto ? ` com ${data.desconto}% de desconto` : ""}.`;
  return {
    title: `${data.titulo} | Alerta Leilões PB`,
    description: desc,
    openGraph: { title: data.titulo, description: desc },
  };
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 8 ? "text-green-400" : score >= 6 ? "text-yellow-400" : "text-red-400";
  const bg = score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500";
  const label = score >= 8 ? "Excelente oportunidade" : score >= 6 ? "Boa oportunidade" : "Oportunidade moderada";
  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-5">
      <p className="text-[#a0a0a0] text-xs uppercase tracking-wider mb-3">Score Radar PB</p>
      <div className="flex items-end gap-3 mb-3">
        <span className={`text-5xl font-black ${color}`}>{score.toFixed(1)}</span>
        <span className="text-[#a0a0a0] text-lg mb-1">/10</span>
      </div>
      <div className="w-full bg-[#0f3460] rounded-full h-2 mb-2">
        <div className={`h-2 rounded-full ${bg} transition-all`} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
    </div>
  );
}

export default async function ImovelPage({ params, searchParams }: Props) {
  const isRadar = searchParams?.ref === "radar";
  const supabase = createServiceClient();
  const { data: imovel, error } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !imovel) notFound();

  const desconto = imovel.desconto ?? (
    imovel.valor_avaliacao && imovel.lance_inicial
      ? Math.round((1 - imovel.lance_inicial / imovel.valor_avaliacao) * 100)
      : null
  );

  const dataLeilao = imovel.data_leilao
    ? new Date(imovel.data_leilao).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const analiseLinhas = imovel.analise_ia
    ? imovel.analise_ia.split("\n").filter(Boolean)
    : null;

  return (
    <main className="min-h-screen bg-[#0f1923] text-white">
      {/* Header nav */}
      <nav className="border-b border-[#0f3460] bg-[#16213e]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#e63946] font-black text-lg">Alerta</span>
            <span className="text-white font-bold text-lg">Leilões PB</span>
          </Link>
          {isRadar ? (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-lg font-semibold">
              ⭐ Assinante Radar PB
            </span>
          ) : (
            <Link
              href={process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ?? "#"}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              📲 Entrar no grupo grátis
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <p className="text-[#a0a0a0] text-sm">
          <Link href="/" className="hover:text-white">Início</Link>
          {" "}/{"  "}
          <span className="text-white">{imovel.cidade}</span>
        </p>

        {/* Imagem + Info básica */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Imagem */}
          <div className="rounded-xl overflow-hidden bg-[#16213e] h-64 md:h-80 flex items-center justify-center relative">
            {imovel.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imovel.imagem_url} alt={imovel.titulo} className="w-full h-full object-cover" />
            ) : (
              <div className="text-6xl text-[#a0a0a0]">🏠</div>
            )}
            {desconto && (
              <div className="absolute top-3 left-3 bg-[#e63946] text-white font-black text-sm px-3 py-1 rounded-full">
                -{desconto}%
              </div>
            )}
          </div>

          {/* Dados do imóvel */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{imovel.titulo}</h1>
              <p className="text-[#a0a0a0] mt-1">
                📍 {imovel.cidade}{imovel.bairro ? ` — ${imovel.bairro}` : ""}
              </p>
              {imovel.endereco && (
                <p className="text-[#a0a0a0] text-sm">{imovel.endereco}</p>
              )}
            </div>

            {/* Preços */}
            <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#a0a0a0] text-sm">Lance mínimo</span>
                <span className="text-2xl font-black text-white">{fmt(imovel.lance_inicial)}</span>
              </div>
              {imovel.valor_avaliacao && (
                <div className="flex justify-between items-center border-t border-[#0f3460] pt-3">
                  <span className="text-[#a0a0a0] text-sm">Valor de avaliação</span>
                  <span className="text-[#a0a0a0] line-through">{fmt(imovel.valor_avaliacao)}</span>
                </div>
              )}
              {desconto && (
                <div className="flex justify-between items-center">
                  <span className="text-[#a0a0a0] text-sm">Desconto</span>
                  <span className="text-green-400 font-bold text-lg">{desconto}% abaixo</span>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {dataLeilao && (
                <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-3">
                  <p className="text-[#a0a0a0] text-xs">Data do leilão</p>
                  <p className="text-white font-medium mt-1">📅 {dataLeilao}</p>
                </div>
              )}
              {imovel.modalidade && (
                <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-3">
                  <p className="text-[#a0a0a0] text-xs">Modalidade</p>
                  <p className="text-white font-medium mt-1">{imovel.modalidade}</p>
                </div>
              )}
              {imovel.tipo_imovel && (
                <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-3">
                  <p className="text-[#a0a0a0] text-xs">Tipo</p>
                  <p className="text-white font-medium mt-1">{imovel.tipo_imovel}</p>
                </div>
              )}
              {imovel.ocupado !== null && (
                <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-3">
                  <p className="text-[#a0a0a0] text-xs">Ocupação</p>
                  <p className={`font-medium mt-1 ${imovel.ocupado ? "text-yellow-400" : "text-green-400"}`}>
                    {imovel.ocupado ? "⚠️ Ocupado" : "✅ Desocupado"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Score */}
        {imovel.score != null && imovel.score > 0 && (
          <ScoreMeter score={imovel.score} />
        )}

        {/* Análise da IA */}
        {analiseLinhas && analiseLinhas.length > 0 && (
          <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-5">
            <p className="text-[#a0a0a0] text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🤖</span> Análise Radar PB
            </p>
            <div className="space-y-2">
              {analiseLinhas.map((linha, i) => (
                <p key={i} className={`text-sm leading-relaxed ${linha.startsWith("•") || linha.startsWith("-") ? "text-[#a0a0a0] pl-2" : "text-white"}`}>
                  {linha}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Link do leiloeiro enviado exclusivamente para assinantes Radar PB via WhatsApp */}
        </div>

        {/* CTA — diferente para Radar vs Gratuito */}
        {isRadar ? (
          <div className="bg-gradient-to-r from-yellow-500/10 to-[#0f3460]/40 border border-yellow-500/30 rounded-xl p-6 text-center">
            <h2 className="text-white font-bold text-lg mb-2">⭐ Você é assinante Radar PB</h2>
            <p className="text-[#a0a0a0] text-sm mb-4">
              Você recebe este alerta antes do grupo gratuito com análise completa, score de oportunidade e link direto do leiloeiro.
            </p>
            <a
              href="/radar"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl transition-colors"
            >
              ⭐ Ver todos os alertas Radar PB
            </a>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#e63946]/20 to-[#0f3460]/40 border border-[#e63946]/30 rounded-xl p-6 text-center">
            <h2 className="text-white font-bold text-lg mb-2">Receba alertas de leilões antes de todo mundo</h2>
            <p className="text-[#a0a0a0] text-sm mb-4">
              Alertas gratuitos via WhatsApp com score de oportunidade, análise de riscos e link direto para o edital.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ?? "#"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                📲 Entrar no grupo grátis
              </a>
              <a
                href="/radar"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl transition-colors"
              >
                ⭐ Radar PB (análise completa)
              </a>
            </div>
          </div>
        )}

        {/* Fonte */}
        <p className="text-[#a0a0a0] text-xs text-center">
          Dados coletados de fontes públicas. Verifique sempre o edital oficial antes de participar do leilão.
          {imovel.processo_numero && ` Processo: ${imovel.processo_numero}.`}
        </p>
      </div>
    </main>
  );
}
