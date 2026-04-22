import Link from "next/link";

import { RADAR_CHECKOUT_URL } from "@/lib/constants";

const CHECKOUT_URL = RADAR_CHECKOUT_URL;

const beneficios = [
  { icone: "⏰", titulo: "Alertas 48h antes", desc: "Você chega antes da concorrência em cada leilão." },
  { icone: "🎯", titulo: "Score 0–10 por imóvel", desc: "Nota objetiva de oportunidade — você sabe o que priorizar." },
  { icone: "⚖️", titulo: "Análise jurídica resumida", desc: "Ocupação, ônus e riscos em linguagem clara, sem juridiquês." },
  { icone: "💰", titulo: "Estimativa de retorno", desc: "Cálculo de potencial de lucro para cada oportunidade." },
  { icone: "📍", titulo: "Foco na Paraíba", desc: "João Pessoa, Campina Grande, Cabedelo e municípios do estado." },
  { icone: "📱", titulo: "Direto no WhatsApp", desc: "Sem app, sem login. Tudo no canal que você já usa." },
  { icone: "📚", titulo: "Histórico de leilões", desc: "Registros anteriores para você comparar e calibrar decisões." },
  { icone: "🔒", titulo: "Cancele quando quiser", desc: "Sem multa, sem fidelidade. Zero burocracia." },
];

const faq = [
  {
    q: "Como recebo os alertas?",
    a: "Diretamente no seu WhatsApp, com 48h de antecedência. Cada alerta traz score, análise jurídica resumida e estimativa de retorno.",
  },
  {
    q: "Qual a diferença do grupo gratuito?",
    a: "O grupo gratuito recebe alertas semanais sem análise aprofundada. O Radar PB entrega análise completa, score, estimativa de lucro e 48h de vantagem.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem multa, sem fidelidade. Cancele pelo painel da Kiwify quando quiser.",
  },
  {
    q: "Cobre quais cidades?",
    a: "João Pessoa, Campina Grande, Cabedelo, Santa Rita, Bayeux e demais municípios da Paraíba.",
  },
  {
    q: "Preciso ter experiência em leilões?",
    a: "Não. Cada alerta explica o imóvel em linguagem simples. Para acompanhamento completo, temos a Mentoria Lance Certo.",
  },
];

export default function RadarPage() {
  return (
    <div className="min-h-screen bg-night-950">
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-night-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center text-sm">🏠</div>
            <span className="font-black text-white text-base leading-none">
              ALERTA <span className="text-gradient-gold">LEILÕES PB</span>
            </span>
          </Link>
          <Link href="/grupo" className="text-sm text-slate-400 hover:text-white transition-colors">
            Grupo gratuito →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-20 px-4 overflow-hidden bg-hero-gradient">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold-light px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            Radar PB — Inteligência de Leilões
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-white">
            Imóveis com potencial real,{" "}
            <span className="text-gradient-gold">48h antes</span>{" "}
            <br className="hidden sm:block" />
            da concorrência
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Score de oportunidade, análise jurídica e estimativa de retorno — entregues no seu WhatsApp antes do martelo cair.
          </p>

          {/* Price callout */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-night-800/70 border border-gold/25 rounded-2xl px-8 py-5 shadow-[0_0_60px_rgba(196,150,42,0.1)]">
            <div className="text-center sm:text-left">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Radar PB</p>
              <div className="flex items-end gap-1">
                <span className="text-white font-black text-5xl leading-none tracking-tight">R$ 37,90</span>
                <span className="text-slate-400 text-base mb-1">/mês</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">≈ R$1,26/dia para arrematar com inteligência</p>
            </div>
            <div className="sm:w-px sm:h-16 w-24 h-px bg-white/10" />
            <div className="flex flex-col gap-1.5 text-sm text-slate-300">
              <span>✓ Cancele quando quiser</span>
              <span>✓ Sem fidelidade</span>
              <span>✓ Pagamento seguro</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 px-10 rounded-xl transition-all cta-glow text-base"
            >
              Assinar Radar PB agora
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <p className="text-slate-500 text-xs">
              Pagamento seguro via Kiwify · Cancele quando quiser · Sem contrato
            </p>
          </div>

          {/* VSL */}
          <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{ boxShadow: "0 0 60px rgba(196,150,42,0.12), 0 30px 60px rgba(0,0,0,0.6)" }}>
            <video
              src="/roteiro.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video bg-black"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 px-4 bg-night-900 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
              O que está incluso
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Tudo que você precisa para{" "}
              <span className="text-gradient-gold">arrematar com inteligência</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className="bg-night-800/60 border border-white/[0.07] hover:border-gold/20 rounded-xl p-5 transition-colors space-y-3"
              >
                <div className="w-11 h-11 bg-gold/[0.08] border border-gold/15 rounded-xl flex items-center justify-center text-xl">
                  {b.icone}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{b.titulo}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 bg-night-950 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
              Plano único
            </span>
            <h2 className="text-3xl font-black text-white">Sem surpresas</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 0 80px rgba(196,150,42,0.2), 0 30px 60px rgba(0,0,0,0.5)" }}>
            <div className="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
            <div className="bg-night-800 border border-gold/30 rounded-b-2xl p-8 space-y-6">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold tracking-widest uppercase text-gold">Radar PB</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-slate-400 text-xl mb-1">R$</span>
                  <span className="text-white font-black text-6xl leading-none tracking-tight">37,90</span>
                  <span className="text-slate-400 text-base mb-2">/mês</span>
                </div>
                <p className="text-slate-500 text-xs">≈ R$1,26/dia para arrematar com inteligência</p>
              </div>

              {/* Value callout */}
              <div className="bg-gold/[0.07] border border-gold/20 rounded-xl px-4 py-3">
                <p className="text-gold-light text-xs font-semibold leading-relaxed text-center">
                  💡 Um único imóvel com 40%+ de desconto já paga meses de assinatura
                </p>
              </div>

              <ul className="space-y-3">
                {beneficios.slice(0, 6).map((b) => (
                  <li key={b.titulo} className="flex items-start gap-3 text-sm">
                    <span className="text-gold mt-0.5 flex-shrink-0 font-bold">✓</span>
                    <span>
                      <span className="text-white font-medium">{b.titulo}</span>
                      <span className="text-slate-400"> — {b.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center font-bold py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cta-glow transition-all text-base"
                >
                  Assinar agora — R$37,90/mês →
                </a>
                <p className="text-center text-slate-500 text-xs">
                  Pagamento seguro via Kiwify · Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-night-900 relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-white">Perguntas frequentes</h2>
          </div>
          <div className="space-y-2">
            {faq.map((item) => (
              <div
                key={item.q}
                className="bg-night-800/60 border border-white/[0.07] hover:border-gold/20 rounded-xl p-5 transition-colors"
              >
                <h3 className="text-white font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 bg-night-950 relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,150,42,0.06),transparent_60%)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Cada semana sem o Radar PB{" "}
            <span className="text-gradient-gold">pode ser uma oportunidade perdida</span>
          </h2>
          <p className="text-slate-400">
            Comece agora e receba seu próximo alerta antes que a concorrência saiba que existe.
          </p>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-xl transition-all cta-glow text-base"
          >
            Assinar Radar PB — R$37,90/mês
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-slate-500 text-sm">
            Ou{" "}
            <Link href="/grupo" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              entre no grupo gratuito
            </Link>{" "}
            primeiro para conhecer nosso trabalho.
          </p>
        </div>
      </section>
    </div>
  );
}
