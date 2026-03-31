import { Card } from "@/components/ui/Card";

const depoimentos = [
  {
    nome: "Roberto S.",
    cidade: "João Pessoa, PB",
    texto: "Arrematei um apartamento em Miramar por R$180k, avaliado em R$320k. O score 9/10 do Radar me deu confiança pra ir fundo.",
    resultado: "Lucro estimado: R$140k",
  },
  {
    nome: "Fernanda L.",
    cidade: "Campina Grande, PB",
    texto: "Estava com medo do processo jurídico. A análise do Radar PB mostrou que o imóvel estava limpo. Não teria ido sem ela.",
    resultado: "Imóvel quitado 58% abaixo do valor",
  },
  {
    nome: "Marcos T.",
    cidade: "Cabedelo, PB",
    texto: "Entrei pelo grupo gratuito, em 3 semanas já entendia mais de leilão do que em 2 anos lendo sozinho. Hoje sou assinante do Radar.",
    resultado: "3 imóveis analisados em 30 dias",
  },
];

export function ProvasSocial() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Resultados reais de{" "}
            <span className="text-gradient">membros reais</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg">
            Sem promessas de ficção. Apenas oportunidades analisadas com seriedade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {depoimentos.map((dep) => (
            <Card key={dep.nome}>
              <div className="space-y-4">
                <div className="flex text-[#e63946]">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-[#e0e0e0] text-sm leading-relaxed italic">"{dep.texto}"</p>
                <div className="border-t border-[#0f3460] pt-4">
                  <p className="font-semibold text-sm">{dep.nome}</p>
                  <p className="text-[#a0a0a0] text-xs">{dep.cidade}</p>
                  <p className="text-[#e63946] text-xs font-bold mt-1">{dep.resultado}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border border-[#0f3460] rounded-2xl p-8 bg-[#16213e]">
          {[
            { valor: "+500", label: "Membros no grupo" },
            { valor: "47", label: "Imóveis analisados" },
            { valor: "R$2.1M", label: "Em oportunidades mapeadas" },
            { valor: "68%", label: "Desconto médio nos alertas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[#e63946]">{stat.valor}</p>
              <p className="text-[#a0a0a0] text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
