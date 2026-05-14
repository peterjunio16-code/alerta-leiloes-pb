import Link from "next/link";

// Score ring SVG — 9.1/10 = 91% of circle (circumference = 2π×14 ≈ 87.96)
function ScoreRing() {
  const r = 14;
  const circ = 2 * Math.PI * r; // 87.96
  const fill = (9.1 / 10) * circ; // 80.0
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-14 h-14" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke="#10b981" strokeWidth="2.5"
          strokeDasharray={`${fill.toFixed(1)}, ${circ.toFixed(1)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black text-sm leading-none">9.1</span>
        <span className="text-slate-500 text-[9px] font-medium">/10</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-hero-gradient">

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">

          {/* ── Left: Text ── */}
          <div className="space-y-7 text-center lg:text-left">

            {/* Kicker */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold-light px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              Inteligência Imobiliária — Paraíba
            </div>

            {/* Headline */}
            <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-black leading-[1.05] tracking-tight text-white">
              Receba os melhores imóveis de{" "}
              <span className="text-gradient-gold">leilão na Paraíba</span>{" "}
              <br className="hidden lg:block" />
              antes da maioria perceber a oportunidade
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              O Alerta Leilões PB filtra imóveis, calcula risco, analisa edital e entrega oportunidades{" "}
              <span className="text-white font-medium">direto no seu WhatsApp.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/grupo"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 cta-glow text-[15px]"
              >
                Entrar no Grupo Gratuito
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/radar"
                className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/15 hover:border-gold/40 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 text-[15px]"
              >
                ⭐ Conhecer o Radar PB
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {[
                { label: "Score de oportunidade 0–10" },
                { label: "Análise jurídica incluída" },
                { label: "Alertas antecipados" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.09] text-slate-400 text-xs px-3.5 py-2 rounded-full"
                >
                  <span className="w-1 h-1 bg-gold rounded-full" />
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { val: "+500", label: "investidores no grupo" },
                { val: "68%", label: "desconto médio" },
                { val: "PB", label: "foco exclusivo" },
              ].map((s, i) => (
                <div key={s.val} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-white/10 hidden sm:block" />}
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-black text-white leading-none">{s.val}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Premium Property Card (mini-dashboard) ── */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px]">

              {/* Glow */}
              <div className="absolute inset-4 bg-gold/12 blur-3xl rounded-3xl pointer-events-none" />

              {/* Card */}
              <div className="relative bg-night-800 border border-gold/25 rounded-2xl shadow-2xl animate-float overflow-hidden"
                style={{ boxShadow: "0 0 60px rgba(196,150,42,0.12), 0 25px 50px rgba(0,0,0,0.5)" }}>

                {/* Image area */}
                <div className="relative h-44 bg-gradient-to-br from-[#1a2a40] via-[#0d1b2e] to-[#060d1a] overflow-hidden">
                  {/* Cityscape silhouette */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-4 pb-3 opacity-[0.18]">
                    {[40,28,64,50,36,72,44,30,56].map((h, i) => (
                      <div key={i} className="bg-slate-300 rounded-t-sm flex-1" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-night-800 via-night-800/50 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-gold text-night-950 text-[11px] font-black px-3 py-1.5 rounded-lg tracking-wide">
                      Leilão em 3 dias
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1.5 rounded-full">
                      −62%
                    </span>
                  </div>

                  {/* Property label */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-bold text-sm leading-tight">Apartamento 3 qtos — Miramar</p>
                    <p className="text-slate-400 text-xs mt-0.5">📍 João Pessoa, Paraíba</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  {/* Score + price row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Avaliação — visually present so the gap is dramatic */}
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 text-sm font-medium line-through leading-none">R$ 320.000</p>
                        <span className="bg-red-600/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none">−62%</span>
                      </div>
                      {/* Lance — the hero number */}
                      <p className="text-white font-black text-[2.1rem] leading-none tracking-tight">R$ 122.000</p>
                      {/* Savings callout */}
                      <p className="text-emerald-400 text-[11px] font-semibold">
                        Lance mínimo · Economia de R$ 198k
                      </p>
                    </div>
                    <ScoreRing />
                  </div>

                  {/* Analysis row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Ocupação", val: "Livre", ok: true },
                      { label: "Ônus", val: "Nenhum", ok: true },
                      { label: "Risco", val: "Baixo", ok: true },
                    ].map((item) => (
                      <div key={item.label} className="bg-night-950/60 rounded-xl p-2.5 text-center">
                        <p className="text-slate-500 text-[9px] font-medium uppercase tracking-wide">{item.label}</p>
                        <p className={`text-[11px] font-bold mt-0.5 ${item.ok ? "text-emerald-400" : "text-red-400"}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
                      Desocupado
                    </span>
                    <span className="bg-gold/10 border border-gold/20 text-gold-light text-xs px-3 py-1 rounded-full font-medium">
                      Alta atratividade
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-4 border-t border-white/[0.05] pt-3">
                  <p className="text-slate-500 text-[11px] text-center">
                    Exemplo de alerta — <span className="text-gold-light font-medium">Radar PB</span>
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 bg-night-800 border border-gold/25 rounded-xl px-4 py-2.5 shadow-xl animate-float-slow">
                <p className="text-gold-light text-xs font-bold leading-none">+500 membros</p>
                <p className="text-slate-500 text-xs mt-0.5">no grupo gratuito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
