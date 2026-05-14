"use client";

import { useState, useMemo } from "react";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function AtratividadeBar({ pct }: { pct: number }) {
  const cor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  const label = pct >= 70 ? "Alta" : pct >= 40 ? "Moderada" : "Baixa";
  const labelCor = pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">Atratividade</span>
        <span className={`font-black ${labelCor}`}>{label} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2.5 bg-night-950 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SimuladorOportunidade() {
  const [avaliacao, setAvaliacao] = useState(320000);
  const [lance, setLance] = useState(122000);
  const [custos, setCustos] = useState(15000);
  const [revenda, setRevenda] = useState(280000);

  const calc = useMemo(() => {
    const desconto = avaliacao > 0 ? ((avaliacao - lance) / avaliacao) * 100 : 0;
    const investimentoTotal = lance + custos;
    const margem = revenda - investimentoTotal;
    const margemPct = investimentoTotal > 0 ? (margem / investimentoTotal) * 100 : 0;
    const economia = avaliacao - lance;
    // Atratividade: ponderação de desconto + margem
    const atratividade = Math.min(100, Math.max(0, desconto * 0.6 + Math.max(0, margemPct) * 0.4));
    return { desconto, investimentoTotal, margem, margemPct, economia, atratividade };
  }, [avaliacao, lance, custos, revenda]);

  const inputCls = "w-full bg-night-950 border border-white/[0.08] focus:border-gold/40 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors font-medium";

  return (
    <section className="py-24 px-4 bg-night-800 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(196,150,42,0.05),transparent_60%)]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Ferramenta educativa
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Simulador de{" "}
            <span className="text-gradient-gold">Oportunidade</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Insira os valores do imóvel e veja o potencial da operação instantaneamente.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest text-gold-light/80">Dados do Imóvel</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Valor de avaliação</label>
              <input
                type="number"
                className={inputCls}
                value={avaliacao}
                onChange={e => setAvaliacao(Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Lance mínimo</label>
              <input
                type="number"
                className={inputCls}
                value={lance}
                onChange={e => setLance(Math.max(0, Number(e.target.value)))}
              />
              {/* Slider */}
              <input
                type="range"
                min={0}
                max={avaliacao}
                value={lance}
                onChange={e => setLance(Number(e.target.value))}
                className="w-full accent-gold mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>R$ 0</span><span>{fmt(avaliacao)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Custos estimados (ITBI, taxas, reforma)</label>
              <input
                type="number"
                className={inputCls}
                value={custos}
                onChange={e => setCustos(Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Valor estimado de revenda / locação capitalizada</label>
              <input
                type="number"
                className={inputCls}
                value={revenda}
                onChange={e => setRevenda(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-5 space-y-1">
                <p className="text-slate-400 text-xs font-medium">Desconto no lance</p>
                <p className={`text-3xl font-black leading-none ${calc.desconto >= 30 ? "text-emerald-400" : calc.desconto >= 15 ? "text-amber-400" : "text-red-400"}`}>
                  {calc.desconto.toFixed(1)}%
                </p>
                <p className="text-slate-500 text-[11px]">abaixo da avaliação</p>
              </div>

              <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-5 space-y-1">
                <p className="text-slate-400 text-xs font-medium">Economia imediata</p>
                <p className="text-xl font-black text-white leading-tight">{fmt(calc.economia)}</p>
                <p className="text-slate-500 text-[11px]">vs. valor de mercado</p>
              </div>

              <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-5 space-y-1">
                <p className="text-slate-400 text-xs font-medium">Investimento total</p>
                <p className="text-xl font-black text-white leading-tight">{fmt(calc.investimentoTotal)}</p>
                <p className="text-slate-500 text-[11px]">lance + custos</p>
              </div>

              <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-5 space-y-1">
                <p className="text-slate-400 text-xs font-medium">Margem potencial</p>
                <p className={`text-xl font-black leading-tight ${calc.margem >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {fmt(calc.margem)}
                </p>
                <p className="text-slate-500 text-[11px]">{calc.margemPct.toFixed(1)}% sobre investido</p>
              </div>
            </div>

            {/* Atratividade */}
            <div className="bg-night-900/80 border border-white/[0.07] rounded-2xl p-5 space-y-4">
              <AtratividadeBar pct={calc.atratividade} />

              <div className="text-center">
                {calc.atratividade >= 70 && (
                  <p className="text-emerald-400 text-sm font-semibold">✅ Oportunidade com alto potencial</p>
                )}
                {calc.atratividade >= 40 && calc.atratividade < 70 && (
                  <p className="text-amber-400 text-sm font-semibold">⚠️ Oportunidade moderada — analise com cuidado</p>
                )}
                {calc.atratividade < 40 && (
                  <p className="text-red-400 text-sm font-semibold">❌ Baixa atratividade — reavalie os números</p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-200/70 text-xs leading-relaxed">
                ⚠️ <strong>Simulação educativa.</strong> Leilões envolvem riscos e exigem análise individual de edital, ocupação e ônus. Este cálculo não garante resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
