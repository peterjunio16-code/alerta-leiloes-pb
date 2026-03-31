import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const beneficios = [
  "🎯 Alertas com 48h de antecedência antes do leilão",
  "📊 Score de oportunidade de 0 a 10 para cada imóvel",
  "⚖️ Análise prévia de risco jurídico e ônus",
  "💰 Estimativa de lucro potencial em cada alerta",
  "📍 Foco exclusivo em imóveis na Paraíba",
  "📚 Histórico completo de leilões anteriores",
  "📱 Alertas direto no WhatsApp, sem app extra",
  "🔒 Cancele quando quiser, sem multa",
];

const faq = [
  {
    pergunta: "Como recebo os alertas?",
    resposta:
      "Diretamente no seu WhatsApp, com antecedência de 48h antes do leilão. Você recebe o score, análise jurídica resumida e link para mais detalhes.",
  },
  {
    pergunta: "Qual a diferença do grupo gratuito?",
    resposta:
      "O grupo gratuito tem alertas semanais sem análise aprofundada. O Radar PB entrega análise completa, score, estimativa de lucro e 48h de vantagem.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Sim. Sem multa, sem fidelidade. Cancele pelo próprio WhatsApp ou pelo painel da Hotmart.",
  },
  {
    pergunta: "Cobre quais cidades da Paraíba?",
    resposta:
      "João Pessoa, Campina Grande, Cabedelo, Santa Rita, Bayeux e demais municípios do estado.",
  },
  {
    pergunta: "Preciso ter experiência em leilões?",
    resposta:
      "Não. Cada alerta explica o imóvel em linguagem simples. Para quem quer acompanhamento completo, temos a mentoria Lance Certo.",
  },
];

export default function RadarPage() {
  const checkoutUrl =
    process.env.HOTMART_CHECKOUT_URL ?? "https://pay.hotmart.com/placeholder";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] px-4 py-1.5 rounded-full text-sm font-medium">
            🎯 Radar PB — Inteligência de Leilões
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Pare de perder{" "}
            <span className="text-[#e63946]">oportunidades</span>{" "}
            por falta de informação
          </h1>
          <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
            Receba análise completa de cada imóvel em leilão na Paraíba —
            score, risco jurídico e estimativa de lucro — 48h antes do martelo cair.
          </p>

          {/* VSL placeholder */}
          <div className="bg-[#0f3460] border border-[#e63946]/20 rounded-2xl aspect-video max-w-2xl mx-auto flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-5xl">▶️</div>
              <p className="text-[#a0a0a0] text-sm">Vídeo de apresentação</p>
              <p className="text-[#a0a0a0] text-xs">(Adicione o embed do YouTube/Vimeo aqui)</p>
            </div>
          </div>

          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-lg px-12 py-5">
              🎯 Assinar Radar PB — R$197/mês
            </Button>
          </a>
          <p className="text-[#a0a0a0] text-sm">
            Cancele quando quiser • Sem contrato de fidelidade
          </p>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4 bg-[#16213e]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que está incluso no <span className="text-[#e63946]">Radar PB</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {beneficios.map((b) => (
              <div
                key={b}
                className="flex items-start gap-3 bg-[#0f3460] rounded-xl p-4 border border-[#1a1a2e]"
              >
                <span className="text-lg leading-none">{b.split(" ")[0]}</span>
                <span className="text-[#e0e0e0] text-sm leading-relaxed">
                  {b.slice(b.indexOf(" ") + 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Plano único, sem surpresas</h2>
          <Card className="border-[#e63946]/30 ring-1 ring-[#e63946]/10">
            <div className="space-y-6">
              <div>
                <p className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Radar PB</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl text-[#a0a0a0]">R$</span>
                  <span className="text-6xl font-black text-white">197</span>
                  <span className="text-[#a0a0a0] mb-2">/mês</span>
                </div>
              </div>
              <ul className="space-y-2 text-left text-sm text-[#e0e0e0]">
                {beneficios.slice(0, 5).map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="text-[#e63946]">✓</span>
                    {b.slice(b.indexOf(" ") + 1)}
                  </li>
                ))}
              </ul>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className="w-full">
                  🎯 Assinar agora — R$197/mês
                </Button>
              </a>
              <p className="text-xs text-[#a0a0a0]">
                Pagamento seguro via Hotmart • Cancele quando quiser
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-[#16213e]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <Card key={item.pergunta}>
                <h3 className="font-semibold text-white mb-2">{item.pergunta}</h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">{item.resposta}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">
            Pronto para arrematar com <span className="text-[#e63946]">segurança</span>?
          </h2>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-lg px-12 py-5">
              🎯 Assinar Radar PB — R$197/mês
            </Button>
          </a>
          <p className="text-[#a0a0a0] text-sm">
            Ou{" "}
            <Link href="/grupo" className="text-[#e63946] hover:underline">
              entre no grupo gratuito
            </Link>{" "}
            primeiro para conhecer nosso trabalho.
          </p>
        </div>
      </section>
    </div>
  );
}
