import Link from "next/link";
import { RADAR_CHECKOUT_URL } from "@/lib/constants";

export function MockupWhatsApp() {
  return (
    <section className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(16,185,129,0.05),transparent_60%)]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: text */}
          <div className="space-y-7">
            <div>
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
                Como chega até você
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Tudo no{" "}
              <span className="text-gradient-gold">WhatsApp</span>{" "}
              que você já usa
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Sem app novo. Sem login. Sem painel complicado. O alerta chega direto na sua conversa, com tudo que você precisa para decidir rapidamente.
            </p>

            <div className="space-y-3">
              {[
                { icon: "⏰", title: "48h de antecedência", desc: "Você vê antes da concorrência agir" },
                { icon: "⭐", title: "Score pronto", desc: "Nota objetiva de 0 a 10 por imóvel" },
                { icon: "⚖️", title: "Risco resumido", desc: "Ocupação, ônus e jurídico em linguagem clara" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 bg-night-800/40 border border-white/[0.06] rounded-xl p-4">
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/grupo"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all cta-glow text-[15px]"
            >
              Entrar no Grupo Gratuito
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right: WhatsApp mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px]">
              {/* Glow */}
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-3xl pointer-events-none" />

              {/* Phone frame */}
              <div className="relative bg-[#111B21] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
                style={{ boxShadow: "0 0 60px rgba(16,185,129,0.15), 0 30px 60px rgba(0,0,0,0.6)" }}>

                {/* Status bar */}
                <div className="bg-[#202C33] px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    🏠
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold leading-none">Radar PB — Alertas</p>
                    <p className="text-emerald-400 text-[10px] mt-0.5">online agora</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-white/60">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.91 14a16 16 0 006.29 6.29l.38-.38a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="bg-[#0B141A] px-3 py-4 space-y-2 min-h-[420px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>

                  {/* Date separator */}
                  <div className="flex justify-center">
                    <span className="bg-[#182229] text-[#8696A0] text-[10px] px-3 py-1 rounded-full">Hoje</span>
                  </div>

                  {/* Message bubble */}
                  <div className="flex justify-start">
                    <div className="bg-[#202C33] rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[90%] shadow-md">

                      {/* Header */}
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/[0.08]">
                        <span className="text-emerald-400 font-black text-xs tracking-wide">🎯 RADAR PB</span>
                        <span className="text-[#8696A0] text-[9px]">• Alerta Premium</span>
                      </div>

                      <div className="space-y-1.5 text-[12px] leading-snug">
                        <p className="text-white font-bold">🏘️ Apto 3 qtos — Miramar</p>
                        <p className="text-[#8696A0]">📍 João Pessoa/PB · <span className="text-amber-400 font-semibold">Leilão em 2 dias</span></p>

                        <div className="bg-[#111B21] rounded-xl p-2.5 my-2 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[#8696A0] text-[11px]">Avaliação</span>
                            <span className="text-white text-[11px] font-semibold line-through opacity-60">R$ 320.000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8696A0] text-[11px]">Lance mínimo</span>
                            <span className="text-white text-[11px] font-black">R$ 122.000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8696A0] text-[11px]">Desconto</span>
                            <span className="text-red-400 text-[11px] font-black">-62%</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-1.5 text-center">
                            <p className="text-emerald-400 text-[10px] font-black">9.1/10</p>
                            <p className="text-[#8696A0] text-[9px]">Score</p>
                          </div>
                          <div className="flex-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-1.5 text-center">
                            <p className="text-emerald-400 text-[10px] font-black">Livre</p>
                            <p className="text-[#8696A0] text-[9px]">Ocupação</p>
                          </div>
                          <div className="flex-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-1.5 text-center">
                            <p className="text-emerald-400 text-[10px] font-black">Baixo</p>
                            <p className="text-[#8696A0] text-[9px]">Risco</p>
                          </div>
                        </div>

                        <p className="text-[#8696A0] text-[9px] pt-1 border-t border-white/[0.06]">
                          _Você recebe isso por ser assinante do Radar PB_
                        </p>
                      </div>

                      <p className="text-[#8696A0] text-[9px] text-right mt-1.5">08:42 ✓✓</p>
                    </div>
                  </div>

                  {/* Quick reply buttons */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {[
                      "📋 Quero análise completa",
                      "🔔 Me avise imóveis parecidos",
                      "💬 Falar com especialista",
                    ].map((btn) => (
                      <div key={btn} className="bg-[#202C33] border border-[#2A3942] rounded-xl px-3 py-2 text-center text-[11px] text-[#00A884] font-semibold cursor-pointer hover:bg-[#2A3942] transition-colors">
                        {btn}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input bar */}
                <div className="bg-[#202C33] px-3 py-2.5 flex items-center gap-2">
                  <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2 text-[#8696A0] text-[11px]">
                    Mensagem
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-night-800 border border-gold/30 rounded-xl px-3 py-2 shadow-xl">
                <p className="text-gold text-xs font-black leading-none">48h antes</p>
                <p className="text-slate-500 text-[10px] mt-0.5">do leilão</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
