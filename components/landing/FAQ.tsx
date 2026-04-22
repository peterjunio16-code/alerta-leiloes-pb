"use client";

import { useState } from "react";

const perguntas = [
  {
    q: "É seguro comprar imóvel em leilão?",
    a: "Sim, quando bem analisado. Leilões judiciais e extrajudiciais são processos legais regulados. O risco está em arrematar sem análise prévia — por isso avaliamos ocupação, ônus e situação jurídica antes de recomendar.",
  },
  {
    q: "Preciso ter o valor total à vista?",
    a: "Depende do tipo de leilão. Alguns aceitam financiamento bancário (CEF, por exemplo), outros exigem pagamento à vista. Informamos a modalidade em cada alerta para você se planejar.",
  },
  {
    q: "Os imóveis podem ter dívidas ou ocupação?",
    a: "Podem — e é exatamente isso que analisamos. Dívidas de condomínio e IPTU costumam seguir o imóvel. Ônus de outros tipos podem ou não ser transferidos. Nossa análise jurídica resumida indica o que encontramos em cada caso.",
  },
  {
    q: "Como funciona o Radar PB?",
    a: "É uma assinatura mensal (R$37,90/mês) em que você recebe alertas de imóveis na Paraíba com 48h de antecedência, score de oportunidade 0–10, análise jurídica resumida e estimativa de retorno. Tudo direto no WhatsApp.",
  },
  {
    q: "O grupo gratuito é realmente gratuito?",
    a: "Sim, 100% gratuito e sem compromisso. Você entra, recebe alertas semanais e conteúdo educativo. Se quiser análise mais aprofundada e antecedência maior, existe o Radar PB.",
  },
  {
    q: "Serve para quem está começando?",
    a: "Sim. O grupo gratuito foi criado justamente para quem está aprendendo. O conteúdo educativo explica o processo, os riscos e como ler um edital. Você aprende enquanto acompanha oportunidades reais.",
  },
  {
    q: "Vocês vendem os imóveis?",
    a: "Não. Somos uma plataforma de inteligência e curadoria de informação. Identificamos e analisamos oportunidades — você toma a decisão de arrematar ou não.",
  },
  {
    q: "Como funciona a Mentoria Lance Certo?",
    a: "É um acompanhamento individual para quem quer arrematar com segurança total. Inclui sessões 1:1, estratégia personalizada de lance, due diligence completa do imóvel escolhido e suporte no dia do leilão. Vagas são limitadas — candidatura por formulário.",
  },
];

export function FAQ() {
  const [aberta, setAberta] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 bg-night-950 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Perguntas frequentes
          </h2>
          <p className="text-slate-400">
            Dúvidas comuns de quem está conhecendo o mercado de leilões.
          </p>
        </div>

        {/* Security callout */}
        <div className="bg-night-800/50 border border-emerald-600/20 rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-emerald-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Segurança em primeiro lugar</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Não vendemos imóveis, não pedimos dados bancários e não fazemos promessas de retorno garantido.
              Somos uma plataforma de curadoria e inteligência de informação. Você decide, sempre.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {perguntas.map((item, i) => {
            const isOpen = aberta === i;
            return (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? "border-gold/30 bg-night-800"
                    : "border-white/[0.07] bg-night-800/40 hover:bg-night-800/70"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setAberta(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-sm leading-snug transition-colors ${
                    isOpen ? "text-white" : "text-slate-200"
                  }`}>
                    {item.q}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isOpen
                      ? "bg-gold border-gold text-night-950 rotate-45"
                      : "border-white/20 text-slate-400"
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="h-px bg-white/[0.06] mb-4" />
                    <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
