const semRadar = [
  { icon: "😓", text: "Pesquisa manual em portais e cartórios" },
  { icon: "📄", text: "Editais confusos com linguagem jurídica" },
  { icon: "🎲", text: "Risco oculto — ocupa, ônus, dívidas" },
  { icon: "⏳", text: "Horas perdidas em imóveis sem potencial" },
  { icon: "🐢", text: "Chega tarde — concorrência já sabe" },
  { icon: "😰", text: "Incerteza na hora de definir o lance" },
];

const comRadar = [
  { icon: "✅", text: "Imóveis filtrados e pré-analisados" },
  { icon: "⭐", text: "Score 0–10 pronto por oportunidade" },
  { icon: "⚖️", text: "Risco jurídico resumido em linguagem clara" },
  { icon: "⚡", text: "Alertas 48h antes — você chega primeiro" },
  { icon: "📊", text: "Estimativa de retorno calculada" },
  { icon: "🎯", text: "Decisão mais segura, lance mais assertivo" },
];

export function SemVsCom() {
  return (
    <section className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            A diferença na prática
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Sem Radar vs{" "}
            <span className="text-gradient-gold">Com Radar PB</span>
          </h2>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Sem Radar */}
          <div className="bg-night-800/50 border border-red-500/20 rounded-2xl overflow-hidden">
            <div className="bg-red-600/10 border-b border-red-500/20 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-sm">✗</div>
              <div>
                <p className="text-white font-bold text-sm">Sem Radar PB</p>
                <p className="text-red-400 text-xs">Navegando no escuro</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {semRadar.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <p className="text-slate-400 text-sm leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Com Radar */}
          <div className="bg-night-800/50 border border-emerald-500/25 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 0 40px rgba(16,185,129,0.06)" }}>
            <div className="bg-emerald-600/10 border-b border-emerald-500/25 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-sm">⭐</div>
              <div>
                <p className="text-white font-bold text-sm">Com Radar PB</p>
                <p className="text-emerald-400 text-xs">Inteligência a seu favor</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {comRadar.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <p className="text-slate-300 text-sm leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom callout */}
        <div className="relative bg-night-800/40 border border-gold/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <p className="text-white font-bold text-xl">
            Por <span className="text-gold">R$1,26/dia</span> você para de perder oportunidades por falta de informação.
          </p>
          <p className="text-slate-400 text-sm mt-2">Menos de um café para tomar decisões de imóveis com inteligência.</p>
        </div>
      </div>
    </section>
  );
}
