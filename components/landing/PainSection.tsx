const painPoints = [
  {
    icon: "🏚",
    title: "Imóvel ocupado",
    desc: "Parece oportunidade, mas a desocupação pode levar anos e custar caro em assessoria jurídica.",
  },
  {
    icon: "📋",
    title: "Edital mal interpretado",
    desc: "Cada cláusula pode esconder armadilhas — modalidade, débitos, prazo de entrega — que mudam tudo.",
  },
  {
    icon: "💸",
    title: "Falsa sensação de desconto",
    desc: "Lances baixos frequentemente escondem dívidas de condomínio, IPTU ou penhoras não transferíveis.",
  },
  {
    icon: "⚖️",
    title: "Risco jurídico ignorado",
    desc: "Ações judiciais, penhoras e ônus reais que o arrematante pode herdar sem saber.",
  },
  {
    icon: "⏱",
    title: "Tempo desperdiçado",
    desc: "Horas de pesquisa em imóveis sem potencial real, que nunca deveriam ter chegado até você.",
  },
];

export function PainSection() {
  return (
    <section className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,150,42,0.03),transparent_70%)]" />
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Por que tantos perdem dinheiro
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Entrar em leilão sem análise{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient-gold">pode sair caro</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            O mercado de leilões é cheio de oportunidades reais — mas também de armadilhas para quem chega sem informação.
          </p>
        </div>

        {/* Pain cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {painPoints.map((p, i) => (
            <div
              key={p.title}
              className={`group relative bg-night-800/60 border border-white/[0.07] hover:border-white/15 rounded-2xl p-6 transition-all duration-300 ${
                i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Red accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

              <div className="space-y-3">
                <div className="w-11 h-11 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center text-xl">
                  {p.icon}
                </div>
                <h3 className="text-white font-bold text-base">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resolution statement */}
        <div className="relative bg-night-800/40 border border-gold/20 rounded-2xl p-8 text-center max-w-3xl mx-auto gold-glow">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            É por isso que o{" "}
            <span className="text-gradient-gold">Alerta Leilões PB</span>{" "}
            filtra tudo antes de chegar até você.
          </p>
          <p className="text-slate-400 mt-3 text-sm">
            Você recebe apenas oportunidades já analisadas — com score, risco e potencial de retorno calculados.
          </p>
        </div>
      </div>
    </section>
  );
}
