import Link from "next/link";

const imoveis = [
  {
    tipo: "Apartamento",
    bairro: "Miramar",
    cidade: "João Pessoa, PB",
    avaliacao: "R$ 320.000",
    lance: "R$ 122.000",
    economia: "R$ 198k economizados",
    desconto: "62%",
    score: 9.1,
    tags: [
      { label: "Desocupado", ok: true },
      { label: "Sem ônus", ok: true },
      { label: "Risco baixo", ok: true },
    ],
    perfil: "Investimento",
    destaque: true,
    // Silhouette columns for property image area
    silhouette: [38, 55, 72, 48, 64, 80, 44, 60, 36, 52],
    accentColor: "from-[#0d2035] to-[#081525]",
  },
  {
    tipo: "Casa",
    bairro: "Tambauzinho",
    cidade: "João Pessoa, PB",
    avaliacao: "R$ 410.000",
    lance: "R$ 198.000",
    economia: "R$ 212k economizados",
    desconto: "52%",
    score: 8.4,
    tags: [
      { label: "Documentação ok", ok: true },
      { label: "IPTU pendente", ok: false },
      { label: "Risco médio", ok: false },
    ],
    perfil: "Moradia / Revenda",
    destaque: false,
    silhouette: [30, 44, 58, 70, 45, 52, 38, 46, 28, 40],
    accentColor: "from-[#0e1f2e] to-[#080f1a]",
  },
  {
    tipo: "Terreno",
    bairro: "Cabedelo",
    cidade: "Cabedelo, PB",
    avaliacao: "R$ 180.000",
    lance: "R$ 82.000",
    economia: "R$ 98k economizados",
    desconto: "54%",
    score: 7.8,
    tags: [
      { label: "450 m²", ok: true },
      { label: "Escritura ok", ok: true },
      { label: "Risco baixo", ok: true },
    ],
    perfil: "Investidor",
    destaque: false,
    silhouette: [20, 28, 18, 30, 24, 22, 28, 16, 22, 26],
    accentColor: "from-[#0b1e18] to-[#06110e]",
  },
];

function ScoreRingSmall({ score }: { score: number }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const color = score >= 9 ? "#10b981" : score >= 8 ? "#34d399" : "#fbbf24";
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-12 h-12" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={`${fill.toFixed(1)}, ${circ.toFixed(1)}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black text-[11px] leading-none">{score}</span>
        <span className="text-slate-500 text-[8px]">/10</span>
      </div>
    </div>
  );
}

export function Vitrine() {
  return (
    <section id="oportunidades" className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(5,150,105,0.03),transparent_60%)]" />
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Exemplos reais do produto
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Cada alerta vem com{" "}
            <span className="text-gradient-gold">análise completa</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Score de oportunidade, situação jurídica e potencial de retorno — para você decidir em segundos.
          </p>
        </div>

        {/* Property cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {imoveis.map((im) => (
            <div
              key={im.bairro}
              className={`group relative bg-night-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                im.destaque
                  ? "border border-gold/30 shadow-[0_0_50px_rgba(196,150,42,0.1)]"
                  : "border border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              {/* Gold top line on featured */}
              {im.destaque && (
                <div className="h-0.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
              )}

              {/* Image area — architectural silhouette */}
              <div className={`relative h-44 bg-gradient-to-br ${im.accentColor} overflow-hidden`}>
                {/* City silhouette */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-0.5 px-3 pb-2 opacity-[0.16]">
                  {im.silhouette.map((h, i) => (
                    <div key={i} className="bg-slate-300 rounded-t-sm flex-1" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-night-800 via-night-800/40 to-transparent" />

                {/* Discount badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1.5 rounded-full shadow">
                    −{im.desconto}
                  </span>
                </div>

                {/* Auction timing */}
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg ${
                    im.destaque
                      ? "bg-gold text-night-950"
                      : "bg-night-950/80 text-slate-300 border border-white/10"
                  }`}>
                    {im.destaque ? "Em 3 dias" : "Em breve"}
                  </span>
                </div>

                {/* Property name */}
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold text-sm leading-tight">{im.tipo} — {im.bairro}</p>
                  <p className="text-slate-400 text-xs mt-0.5">📍 {im.cidade}</p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-4">

                {/* Price + score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-sm line-through leading-none">{im.avaliacao}</p>
                      <span className="bg-red-600/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded">−{im.desconto}</span>
                    </div>
                    <p className="text-white font-black text-2xl leading-none tracking-tight">{im.lance}</p>
                    <p className="text-emerald-400 text-[10px] font-semibold">{im.economia}</p>
                  </div>
                  <ScoreRingSmall score={im.score} />
                </div>

                {/* Analysis tags */}
                <div className="grid grid-cols-3 gap-1.5">
                  {im.tags.map((tag) => (
                    <div key={tag.label} className="bg-night-950/60 rounded-lg p-2 text-center">
                      <p className={`text-[10px] font-semibold leading-tight ${tag.ok ? "text-emerald-400" : "text-red-400"}`}>
                        {tag.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Perfil tag */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                    im.destaque
                      ? "bg-gold/10 border-gold/20 text-gold-light"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}>
                    {im.perfil}
                  </span>
                  {im.destaque && (
                    <Link
                      href="/radar"
                      className="text-gold-light text-[11px] font-semibold hover:text-gold transition-colors"
                    >
                      Ver análise →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer + CTA */}
        <div className="text-center space-y-5">
          <p className="text-slate-500 text-xs">
            * Exemplos ilustrativos com dados reais de leilões na Paraíba. Alertas chegam direto no WhatsApp com análise e score.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/grupo"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all cta-glow text-sm"
            >
              Receber alertas grátis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/radar"
              className="inline-flex items-center justify-center gap-2 border border-gold/30 hover:bg-gold/5 text-gold-light font-semibold py-4 px-8 rounded-xl transition-colors text-sm"
            >
              ⭐ Análise completa com Radar PB
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
