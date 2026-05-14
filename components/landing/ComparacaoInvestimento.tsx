const linhas = [
  {
    item: "Retorno médio anual",
    bolsa: "10–15% (Ibovespa histórico)",
    leilao: "30–60%+ de desconto no lance",
    destaque: "leilao",
  },
  {
    item: "Valor mínimo para começar",
    bolsa: "R$ 100 (ações fracionadas)",
    leilao: "A partir de ~R$ 50 mil",
    destaque: null,
  },
  {
    item: "Previsibilidade",
    bolsa: "Sujeito à volatilidade do mercado",
    leilao: "Desconto fixo no momento da compra",
    destaque: "leilao",
  },
  {
    item: "Proteção contra inflação",
    bolsa: "Parcial (depende dos ativos)",
    leilao: "Alta (imóvel é ativo real)",
    destaque: "leilao",
  },
  {
    item: "Riscos",
    bolsa: "Mercado, empresa, conjuntura",
    leilao: "Jurídico, ocupação — analisáveis",
    destaque: null,
  },
  {
    item: "Acesso à informação",
    bolsa: "Relatórios públicos, amplos",
    leilao: "Exige análise especializada",
    destaque: null,
  },
  {
    item: "Potencial de lucro em 1 compra",
    bolsa: "Raro superar 30% no ano",
    leilao: "40–60% já no arremate",
    destaque: "leilao",
  },
];

export function ComparacaoInvestimento() {
  return (
    <section className="py-20 px-4 bg-night-900 relative">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Por que leilão?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Bolsa de Valores vs.{" "}
            <span className="text-gradient-gold">Leilão Imobiliário</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Enquanto a bolsa exige paciência de anos e aceita volatilidade, no leilão o desconto já está garantido no momento do arremate.
          </p>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left p-4 text-slate-400 font-medium bg-night-800/60 w-1/3">Critério</th>
                <th className="text-center p-4 text-slate-400 font-medium bg-night-800/60">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">📊</span>
                    <span>Bolsa de Valores</span>
                  </div>
                </th>
                <th className="text-center p-4 font-bold bg-gold/[0.07] border-l border-gold/20">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🏠</span>
                    <span className="text-gold">Leilão Imobiliário PB</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, i) => (
                <tr
                  key={linha.item}
                  className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-night-800/20" : ""}`}
                >
                  <td className="p-4 text-slate-300 font-medium">{linha.item}</td>
                  <td className="p-4 text-center text-slate-400">{linha.bolsa}</td>
                  <td className={`p-4 text-center border-l border-gold/10 font-medium ${linha.destaque === "leilao" ? "text-gold" : "text-slate-300"}`}>
                    {linha.destaque === "leilao" && <span className="mr-1">✓ </span>}
                    {linha.leilao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards de destaque */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-night-800/60 border border-gold/20 rounded-xl p-5 text-center space-y-2">
            <p className="text-4xl font-black text-gold">40–60%</p>
            <p className="text-slate-300 text-sm font-medium">Desconto médio nos leilões de 2ª praça na PB</p>
          </div>
          <div className="bg-night-800/60 border border-white/[0.07] rounded-xl p-5 text-center space-y-2">
            <p className="text-4xl font-black text-white">R$ 37,90</p>
            <p className="text-slate-400 text-sm font-medium">Por mês para monitorar todos os leilões da Paraíba</p>
          </div>
          <div className="bg-night-800/60 border border-emerald-500/20 rounded-xl p-5 text-center space-y-2">
            <p className="text-4xl font-black text-emerald-400">1 imóvel</p>
            <p className="text-slate-400 text-sm font-medium">Já paga meses de assinatura do Radar PB</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-slate-600 text-xs">
          * Comparação ilustrativa. Retornos passados não garantem resultados futuros. Leilões envolvem riscos que devem ser analisados caso a caso.
        </p>
      </div>
    </section>
  );
}
