const criterios = [
  { label: "Desconto no lance", valor: 9.2, cor: "emerald", desc: "Lance 62% abaixo da avaliação de mercado" },
  { label: "Localização", valor: 8.8, cor: "emerald", desc: "Bairro Miramar, alta demanda e liquidez" },
  { label: "Ocupação", valor: 10, cor: "emerald", desc: "Imóvel desocupado — disponível imediatamente" },
  { label: "Ônus e débitos", valor: 9.5, cor: "emerald", desc: "Sem penhoras, IPTU regular, matrícula limpa" },
  { label: "Liquidez estimada", valor: 8.1, cor: "emerald", desc: "Alta liquidez — tipo de imóvel com boa saída" },
  { label: "Risco jurídico", valor: 8.9, cor: "emerald", desc: "Ação extinta, sem recursos pendentes" },
];

const SCORE_GERAL = 9.1;

function ScoreBar({ valor, cor }: { valor: number; cor: string }) {
  const pct = (valor / 10) * 100;
  return (
    <div className="h-1.5 bg-night-950 rounded-full overflow-hidden flex-1">
      <div
        className={`h-full rounded-full bg-${cor}-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ScoreRingLarge() {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (SCORE_GERAL / 10) * circ;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-36 h-36" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="8"
          strokeDasharray={`${fill.toFixed(1)}, ${circ.toFixed(1)}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black text-4xl leading-none">{SCORE_GERAL}</span>
        <span className="text-slate-500 text-sm font-medium">/10</span>
        <span className="text-emerald-400 text-xs font-bold mt-1">Excelente</span>
      </div>
    </div>
  );
}

export function ScoreVisual() {
  return (
    <section className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(16,185,129,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Score de oportunidade
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Cada imóvel recebe uma{" "}
            <span className="text-gradient-gold">nota objetiva</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Sem achismo. O score é calculado automaticamente com base em 6 critérios e você sabe exatamente o que priorizar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Score ring + label */}
          <div className="bg-night-800/60 border border-white/[0.07] rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm font-medium">Apto 3 qtos — Miramar, João Pessoa</p>
              <ScoreRingLarge />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { range: "0–4", label: "Evitar", cor: "text-red-400" },
                { range: "4–7", label: "Analisar", cor: "text-amber-400" },
                { range: "7–10", label: "Priorizar", cor: "text-emerald-400" },
              ].map((l) => (
                <div key={l.range} className="bg-night-950/60 rounded-lg p-2">
                  <p className={`font-black ${l.cor}`}>{l.range}</p>
                  <p className="text-slate-500 mt-0.5">{l.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {criterios.map((c) => (
              <div key={c.label} className="bg-night-800/40 border border-white/[0.06] hover:border-emerald-500/20 rounded-xl p-4 transition-colors space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs font-medium flex-1">{c.label}</span>
                  <div className="flex items-center gap-2 w-2/3">
                    <ScoreBar valor={c.valor} cor={c.cor} />
                    <span className="text-emerald-400 text-xs font-black w-6 text-right flex-shrink-0">{c.valor}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[11px] leading-snug">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-600 text-xs">
          * Exemplo baseado em imóvel real analisado pelo Radar PB. Scores variam por imóvel.
        </p>
      </div>
    </section>
  );
}
