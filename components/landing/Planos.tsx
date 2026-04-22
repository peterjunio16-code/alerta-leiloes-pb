import Link from "next/link";
import { RADAR_CHECKOUT_URL } from "@/lib/constants";

const CHECKOUT_URL = RADAR_CHECKOUT_URL;

export function Planos() {
  return (
    <section id="planos" className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,150,42,0.05),transparent_65%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Escolha seu nível
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Do aprendizado ao{" "}
            <span className="text-gradient-gold">arremate inteligente</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Comece de graça. Evolua quando estiver pronto.
          </p>
        </div>

        {/* Plans grid — Radar PB is the visual centerpiece */}
        <div className="grid md:grid-cols-3 gap-0 md:gap-6 items-end">

          {/* ── Gratuito ── */}
          <div className="relative flex flex-col rounded-2xl md:rounded-r-none bg-night-800/50 border border-white/[0.08] md:border-r-0 overflow-hidden h-full">
            <div className="flex-1 p-7 flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Grupo Gratuito</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white leading-none">R$ 0</span>
                  <span className="text-slate-500 text-sm mb-0.5">/ para sempre</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A porta de entrada para quem quer aprender o mercado de leilões na Paraíba.
                </p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {[
                  "Alertas semanais de leilões",
                  "Conteúdo educativo",
                  "Dicas de análise de editais",
                  "Acesso à comunidade",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-slate-400">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/grupo"
                className="block w-full text-center font-bold py-3.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white transition-all text-sm"
              >
                Entrar no Grupo
              </Link>
            </div>
          </div>

          {/* ── Radar PB — FEATURED ── */}
          <div className="relative flex flex-col rounded-2xl overflow-hidden z-10 md:-my-4"
            style={{ boxShadow: "0 0 80px rgba(196,150,42,0.25), 0 30px 60px rgba(0,0,0,0.5)" }}>

            {/* Gold top bar */}
            <div className="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

            {/* "Mais assinado" badge */}
            <div className="absolute top-5 right-5 bg-gold text-night-950 text-[10px] font-black px-3 py-1.5 rounded-full tracking-wide shadow-lg">
              ⭐ Mais Assinado
            </div>

            <div className="flex-1 bg-night-800 p-7 flex flex-col gap-6 border-x border-b border-gold/30 rounded-b-2xl">

              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold tracking-widest uppercase text-gold">Radar PB</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white leading-none tracking-tight">R$ 37,90</span>
                  <span className="text-slate-400 text-sm mb-1.5">/ mês</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Para investidores que querem agir com inteligência e chegar <strong className="text-white">48h antes</strong> da concorrência.
                </p>
              </div>

              {/* Value callout */}
              <div className="bg-gold/[0.07] border border-gold/20 rounded-xl px-4 py-3">
                <p className="text-gold-light text-xs font-semibold leading-relaxed">
                  💡 Um único imóvel com 40%+ de desconto já cobre meses de assinatura
                </p>
              </div>

              <ul className="space-y-3 flex-1">
                {[
                  { item: "Alertas 48h antes do leilão", destaque: true },
                  { item: "Score de oportunidade 0–10", destaque: true },
                  { item: "Análise jurídica resumida", destaque: true },
                  { item: "Estimativa de potencial de retorno", destaque: false },
                  { item: "Foco exclusivo em João Pessoa / PB", destaque: false },
                  { item: "Cancele quando quiser", destaque: false },
                ].map(({ item, destaque }) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-gold mt-0.5 flex-shrink-0 font-bold">✓</span>
                    <span className={destaque ? "text-white font-medium" : "text-slate-300"}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center font-bold py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cta-glow transition-all text-[15px]"
                >
                  Assinar Radar PB →
                </a>
                <p className="text-center text-slate-500 text-[10px]">Sem fidelidade · Cancele quando quiser</p>
              </div>
            </div>
          </div>

          {/* ── Mentoria ── */}
          <div className="relative flex flex-col rounded-2xl md:rounded-l-none bg-gradient-to-b from-night-800 to-night-950 border border-gold/20 md:border-l-0 overflow-hidden h-full">

            {/* Premium badge */}
            <div className="absolute top-5 right-5 bg-white/10 border border-gold/30 text-gold-light text-[10px] font-bold px-3 py-1.5 rounded-full">
              Premium
            </div>

            <div className="flex-1 p-7 flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Mentoria Lance Certo</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-slate-200 leading-none">Sob consulta</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Acompanhamento 1:1 para arrematar com total segurança e máximo retorno.
                </p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {[
                  "Sessões individuais com especialista",
                  "Estratégia personalizada de lance",
                  "Due diligence completa do imóvel",
                  "Suporte no dia do leilão",
                  "Pós-arrematação e regularização",
                  "Vagas muito limitadas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-gold/60 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-slate-400">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/mentoria"
                className="block w-full text-center font-bold py-3.5 rounded-xl border border-gold/40 hover:bg-gold/5 text-gold-light transition-all text-sm"
              >
                Quero a Mentoria
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-10">
          Pagamento seguro via Hotmart · Cancele quando quiser · Sem contrato de fidelidade
        </p>
      </div>
    </section>
  );
}
