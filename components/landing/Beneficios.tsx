const beneficios = [
  {
    icon: "⭐",
    title: "Score de oportunidade 0–10",
    desc: "Cada imóvel recebe uma nota objetiva baseada em desconto, risco, localização e situação jurídica.",
    color: "gold",
  },
  {
    icon: "⚖️",
    title: "Análise jurídica simplificada",
    desc: "Ocupação, ônus, ações em curso e situação do edital resumidos em linguagem direta — sem juridiquês.",
    color: "gold",
  },
  {
    icon: "🔔",
    title: "Alertas com antecedência",
    desc: "Grupo gratuito recebe alertas semanais. Assinantes do Radar PB recebem 48h antes do leilão.",
    color: "emerald",
  },
  {
    icon: "📍",
    title: "Foco exclusivo na Paraíba",
    desc: "João Pessoa, Campina Grande, Cabedelo, Santa Rita e municípios do estado — sem dispersão.",
    color: "gold",
  },
  {
    icon: "🔍",
    title: "Curadoria de oportunidades",
    desc: "Filtramos centenas de imóveis para entregar apenas os que têm potencial real de retorno.",
    color: "gold",
  },
  {
    icon: "📱",
    title: "Direto no WhatsApp",
    desc: "Sem app extra, sem login, sem plataforma complicada. Tudo chega no canal que você já usa.",
    color: "emerald",
  },
];

export function Beneficios() {
  return (
    <section className="py-24 px-4 bg-night-800 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(196,150,42,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            O que você recebe
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Inteligência que transforma{" "}
            <span className="text-gradient-gold">tempo em vantagem</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tudo que você precisaria pesquisar sozinho — entregue de forma clara, direta e acionável.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {beneficios.map((b) => (
            <div
              key={b.title}
              className="group bg-night-950/60 border border-white/[0.07] hover:border-white/15 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  b.color === "gold"
                    ? "bg-gold/10 border border-gold/20"
                    : "bg-emerald-600/10 border border-emerald-600/20"
                }`}>
                  {b.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm leading-snug mb-2">{b.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
