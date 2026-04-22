import Link from "next/link";

const passos = [
  {
    num: "01",
    titulo: "Você entra no grupo gratuito",
    desc: "Cadastro simples, sem compromisso. Você começa a receber alertas semanais de imóveis em leilão na Paraíba — direto no WhatsApp.",
    cta: { label: "Entrar grátis", href: "/grupo" },
    borderColor: "border-emerald-600/30",
    numColor: "text-emerald-500",
    accent: "emerald",
  },
  {
    num: "02",
    titulo: "Recebe imóveis filtrados com análise",
    desc: "Cada alerta traz o que você precisa saber: score de oportunidade, situação jurídica resumida, avaliação versus lance, e perfil do imóvel.",
    cta: null,
    borderColor: "border-gold/30",
    numColor: "text-gold-light",
    accent: "gold",
  },
  {
    num: "03",
    titulo: "Decide se aprofunda ou parte para ação",
    desc: "Quer análise completa com 48h de antecedência? Assine o Radar PB. Precisa de acompanhamento individual? A Mentoria Lance Certo é para você.",
    cta: { label: "Conhecer o Radar PB", href: "/radar" },
    borderColor: "border-white/10",
    numColor: "text-slate-400",
    accent: "slate",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(196,150,42,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Como funciona
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Do grupo ao{" "}
            <span className="text-gradient-gold">primeiro arremate</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {passos.map((passo, i) => (
            <div
              key={passo.num}
              className={`relative flex flex-col sm:flex-row gap-6 bg-night-800/60 border ${passo.borderColor} rounded-2xl p-7 hover:bg-night-800/80 transition-colors`}
            >
              {/* Step number circle */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-night-950 border border-white/10 rounded-2xl flex items-center justify-center">
                  <span className={`text-sm font-black tabular-nums ${passo.numColor}`}>
                    {passo.num}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2.5 min-w-0">
                <h3 className="text-white font-bold text-lg leading-snug">{passo.titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{passo.desc}</p>
                {passo.cta && (
                  <Link
                    href={passo.cta.href}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      passo.accent === "emerald"
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-gold-light hover:text-gold"
                    }`}
                  >
                    {passo.cta.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Connector dot between steps */}
              {i < passos.length - 1 && (
                <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-5 h-5 bg-night-900 border border-white/10 rounded-full flex items-center justify-center z-10 hidden sm:flex">
                  <div className="w-1.5 h-1.5 bg-gold/30 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
