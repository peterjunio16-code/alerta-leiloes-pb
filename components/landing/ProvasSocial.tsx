const depoimentos = [
  {
    iniciais: "RS",
    nome: "Roberto S.",
    cidade: "João Pessoa, PB",
    tipo: "Assinante Radar PB",
    resultado: "+R$ 140.000",
    destaque: "Comprei pela metade do valor de avaliação.",
    texto:
      "O score do Radar PB foi determinante — sem ele eu teria ficado em dúvida. Hoje o imóvel vale R$140k a mais do que paguei.",
    stars: 5,
    color: "emerald",
  },
  {
    iniciais: "FL",
    nome: "Fernanda L.",
    cidade: "Campina Grande, PB",
    tipo: "Assinante Radar PB",
    resultado: "58% de desconto",
    destaque: "O alerta chegou 48h antes. Arremei com total segurança.",
    texto:
      "A análise jurídica mostrou que o imóvel estava desocupado e sem ônus além do IPTU. Sem o Radar eu não teria tido coragem.",
    stars: 5,
    color: "gold",
  },
  {
    iniciais: "MT",
    nome: "Marcos T.",
    cidade: "João Pessoa, PB",
    tipo: "Membro do Grupo",
    resultado: "1º arrematante",
    destaque: "Em 3 meses aprendi o suficiente para ir ao meu primeiro leilão.",
    texto:
      "Entrei no grupo gratuito sem saber nada. Arrematei. O conteúdo educativo fez toda a diferença para eu entender o processo.",
    stars: 5,
    color: "slate",
  },
];

const stats = [
  { valor: "+500", label: "Membros no grupo" },
  { valor: "47+", label: "Imóveis analisados" },
  { valor: "68%", label: "Desconto médio" },
  { valor: "PB", label: "Foco exclusivo" },
];

type ColorKey = "emerald" | "gold" | "slate";

const colorMap: Record<ColorKey, { border: string; tag: string; tagBg: string; ring: string }> = {
  emerald: {
    border: "border-emerald-600/25",
    tag: "text-emerald-400",
    tagBg: "bg-emerald-600/10 border-emerald-600/20",
    ring: "ring-emerald-600/20",
  },
  gold: {
    border: "border-gold/25",
    tag: "text-gold-light",
    tagBg: "bg-gold/10 border-gold/20",
    ring: "ring-gold/15",
  },
  slate: {
    border: "border-white/[0.08]",
    tag: "text-slate-400",
    tagBg: "bg-white/5 border-white/10",
    ring: "ring-white/5",
  },
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gold">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ProvasSocial() {
  return (
    <section id="depoimentos" className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,150,42,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Resultados reais
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Quem age com inteligência{" "}
            <span className="text-gradient-gold">colhe resultados</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Histórias reais de membros da comunidade Alerta Leilões PB.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-night-800/60 border border-white/[0.07] rounded-xl px-5 py-4 text-center"
            >
              <p className="text-3xl font-black text-white leading-none">{s.valor}</p>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((d) => {
            const c = colorMap[d.color as ColorKey];
            return (
              <div
                key={d.nome}
                className={`relative bg-night-800/70 border ${c.border} rounded-2xl p-6 flex flex-col gap-4 ring-1 ${c.ring} transition-shadow hover:shadow-lg`}
              >
                {/* Large decorative quote mark */}
                <div className="absolute top-4 right-5 text-7xl font-black leading-none text-white/[0.04] select-none pointer-events-none" aria-hidden="true">
                  &ldquo;
                </div>

                {/* Stars + result badge */}
                <div className="flex items-center justify-between gap-3">
                  <Stars count={d.stars} />
                  <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border text-xs font-bold ${c.tagBg} ${c.tag}`}>
                    <span className="text-[10px]">✦</span>
                    {d.resultado}
                  </div>
                </div>

                {/* Highlighted quote */}
                <p className={`font-bold text-base leading-snug ${c.tag}`}>
                  &ldquo;{d.destaque}&rdquo;
                </p>

                {/* Full quote */}
                <p className="text-slate-400 text-sm leading-relaxed flex-1">
                  {d.texto}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                  <div className={`w-10 h-10 rounded-full bg-night-950 border ${c.border} flex items-center justify-center text-xs font-black text-slate-200`}>
                    {d.iniciais}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-none">{d.nome}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{d.cidade}</p>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${c.tagBg} ${c.tag}`}>
                    {d.tipo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
