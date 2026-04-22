// ConfiancaBar — compact trust strip immediately after the hero
// Objective: reduce fear of scam before the visitor scrolls any further

const sinais = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    titulo: "Leilões 100% oficiais",
    desc: "Judicial e extrajudicial — todas as fontes são públicas e verificáveis.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    titulo: "Curadoria antes de publicar",
    desc: "Cada imóvel é verificado antes de chegar até você — ocupação, ônus e risco.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    titulo: "Não vendemos imóveis",
    desc: "Somos plataforma de inteligência e curadoria — a decisão de arrematar é sua.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    titulo: "Foco exclusivo na Paraíba",
    desc: "Só imóveis em João Pessoa e no estado da PB — sem ruído de outros mercados.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    titulo: "+500 membros ativos",
    desc: "Comunidade real de investidores acompanhando oportunidades na Paraíba.",
  },
];

export function ConfiancaBar() {
  return (
    <section className="py-10 px-4 bg-night-950 relative overflow-hidden border-y border-white/[0.04]">
      {/* Subtle center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,150,42,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Label */}
        <p className="text-center text-slate-600 text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
          Por que confiar na plataforma
        </p>

        {/* Trust items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {sinais.map((s) => (
            <div
              key={s.titulo}
              className="group flex flex-col items-center text-center gap-2.5 bg-night-800/30 border border-white/[0.05] hover:border-gold/15 rounded-xl px-3 py-4 transition-colors"
            >
              <div className="w-9 h-9 bg-gold/[0.08] border border-gold/15 rounded-xl flex items-center justify-center text-gold/70 group-hover:text-gold transition-colors flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-tight">{s.titulo}</p>
                <p className="text-slate-500 text-[10px] leading-snug mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
