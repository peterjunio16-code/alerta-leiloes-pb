// ProdutoEmUso — shows what the member actually receives
// Phone mockup with a realistic WhatsApp alert message

function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 280 }}>
      {/* Glow behind phone */}
      <div className="absolute inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Phone shell */}
      <div className="relative bg-[#111] border-2 border-white/10 rounded-[2.8rem] shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}>

        {/* Status bar */}
        <div className="bg-[#111] flex justify-between items-center px-6 py-2.5">
          <span className="text-white text-[10px] font-semibold">9:41</span>
          <div className="w-16 h-4 bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white"><path d="M1.5 8.5C5.4 4.6 10.4 2.5 12 2.5s6.6 2.1 10.5 6L21 10c-3.3-3.3-7.4-5-9-5s-5.7 1.7-9 5L1.5 8.5z"/><path d="M5.5 12.5C7.9 10.1 10 9 12 9s4.1 1.1 6.5 3.5L17 14c-1.8-1.8-3.4-2.5-5-2.5S8.8 12.2 7 14L5.5 12.5z"/><path d="M9 16.5c.9-.9 2.1-1.5 3-1.5s2.1.6 3 1.5L12 20l-3-3.5z"/></svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M20 10v4a2 2 0 000-4z"/></svg>
          </div>
        </div>

        {/* WhatsApp chat header */}
        <div className="bg-[#1f2c34] flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-full bg-emerald-700/40 border border-emerald-600/30 flex items-center justify-center text-sm flex-shrink-0">
            🏠
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-semibold leading-none">Radar PB — Alertas</p>
            <p className="text-emerald-400 text-[10px] mt-0.5">online agora</p>
          </div>
        </div>

        {/* Chat body */}
        <div className="bg-[#0b141a] px-3 py-4 space-y-3 min-h-[360px]">

          {/* Date chip */}
          <div className="flex justify-center">
            <span className="bg-[#1f2c34] text-slate-400 text-[9px] px-3 py-1 rounded-full">Hoje, 07:34</span>
          </div>

          {/* System message bubble */}
          <div className="flex justify-start">
            <div className="bg-[#1f2c34] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] shadow space-y-3">

              {/* Alert header */}
              <div className="flex items-center gap-2">
                <span className="bg-gold text-night-950 text-[9px] font-black px-2 py-0.5 rounded-md tracking-wide">
                  ALERTA RADAR PB
                </span>
                <span className="text-slate-400 text-[9px]">48h antes</span>
              </div>

              {/* Property name */}
              <div>
                <p className="text-white text-[12px] font-bold leading-tight">Apto 3 quartos — Miramar</p>
                <p className="text-slate-400 text-[10px] mt-0.5">📍 João Pessoa, PB · Leilão em 2 dias</p>
              </div>

              {/* Price block */}
              <div className="bg-[#0d1b24] rounded-xl p-2.5 space-y-1">
                <p className="text-slate-500 text-[9px] line-through">Avaliação: R$ 320.000</p>
                <p className="text-white font-black text-[18px] leading-none tracking-tight">R$ 122.000</p>
                <p className="text-emerald-400 text-[9px] font-semibold">Lance mínimo · −62% do valor</p>
              </div>

              {/* Score + analysis */}
              <div className="flex items-center gap-2">
                {/* Mini score ring */}
                <div className="relative w-11 h-11 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-11 h-11" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="2.5"
                      strokeDasharray="80.0, 87.96" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-black text-[10px] leading-none">9.1</span>
                    <span className="text-slate-500 text-[7px]">/10</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 flex-1">
                  {[["Ocupação","Livre"],["Ônus","Nenhum"],["Risco","Baixo"]].map(([k,v]) => (
                    <div key={k} className="bg-[#0d1b24] rounded-lg p-1.5 text-center">
                      <p className="text-slate-500 text-[7px] uppercase tracking-wide leading-none">{k}</p>
                      <p className="text-emerald-400 text-[9px] font-bold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-emerald-600/15 border border-emerald-600/25 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-medium">
                  Desocupado
                </span>
                <span className="bg-gold/10 border border-gold/20 text-gold-light text-[9px] px-2 py-0.5 rounded-full font-medium">
                  Alta atratividade
                </span>
              </div>

              {/* Time */}
              <p className="text-right text-slate-600 text-[9px]">07:34 ✓✓</p>
            </div>
          </div>

          {/* Member reply */}
          <div className="flex justify-end">
            <div className="bg-[#005c4b] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[72%] shadow">
              <p className="text-white text-[11px]">Perfeito, vou ao leilão! 🙌</p>
              <p className="text-right text-emerald-300/60 text-[9px] mt-0.5">07:41 ✓✓</p>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-[#1f2c34] flex items-center gap-2 px-3 py-2.5 border-t border-white/5">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-slate-500 text-[11px]">Mensagem</span>
          </div>
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const diferenciais = [
  {
    icon: "⏰",
    titulo: "48h de vantagem",
    desc: "Alertas chegam dois dias antes do leilão — você tem tempo de estudar e decidir.",
  },
  {
    icon: "🎯",
    titulo: "Score 0–10 por alerta",
    desc: "Cada imóvel recebe uma nota de oportunidade para você priorizar sem perder tempo.",
  },
  {
    icon: "⚖️",
    titulo: "Análise jurídica resumida",
    desc: "Ocupação, ônus e riscos legais resumidos em linguagem clara — sem juridiquês.",
  },
  {
    icon: "📍",
    titulo: "Foco total na Paraíba",
    desc: "Só imóveis em João Pessoa e no estado da PB. Sem ruído de outros mercados.",
  },
];

export function ProdutoEmUso() {
  return (
    <section id="produto" className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(16,185,129,0.04),transparent_55%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: phone mockup ── */}
          <div className="flex justify-center lg:justify-end order-2 lg:order-1">
            <PhoneMockup />
          </div>

          {/* ── Right: explanation ── */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
                Como funciona na prática
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Um alerta completo{" "}
                <span className="text-gradient-gold">direto no seu WhatsApp</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Sem planilhas, sem editais confusos. O Radar PB entrega tudo o que você precisa para decidir com segurança — em segundos.
              </p>
            </div>

            {/* Diferenciais */}
            <div className="grid sm:grid-cols-2 gap-4">
              {diferenciais.map((d) => (
                <div key={d.titulo} className="bg-night-800/60 border border-white/[0.07] rounded-xl p-4 space-y-2 hover:border-gold/20 transition-colors">
                  <div className="text-2xl">{d.icon}</div>
                  <p className="text-white font-semibold text-sm leading-tight">{d.titulo}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>

            {/* Mini CTA */}
            <div className="bg-night-800/50 border border-gold/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                ⭐
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Radar PB — R$ 37,90/mês</p>
                <p className="text-slate-400 text-xs mt-0.5">Cancele quando quiser. Sem contrato.</p>
              </div>
              <a
                href="https://pay.kiwify.com.br/V8TxxkE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-gold hover:bg-gold-dark text-night-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                Assinar
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
