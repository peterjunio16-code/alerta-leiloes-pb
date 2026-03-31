import { Card } from "@/components/ui/Card";

const niveis = [
  {
    numero: "01",
    titulo: "Grupo Gratuito",
    subtitulo: "Para quem quer aprender",
    descricao: "Alertas semanais de imóveis em leilão na Paraíba. Conteúdo educativo, cases reais e dicas para quem está começando. Totalmente gratuito.",
    cor: "#a0a0a0",
    icone: "📢",
  },
  {
    numero: "02",
    titulo: "Radar PB",
    subtitulo: "R$ 197/mês • Para quem quer agir",
    descricao: "Alertas com 48h de antecedência, score de oportunidade (0–10), análise de risco jurídico, estimativa de lucro e acesso ao histórico completo.",
    cor: "#e63946",
    icone: "🎯",
    destaque: true,
  },
  {
    numero: "03",
    titulo: "Lance Certo",
    subtitulo: "Mentoria Individual • Vagas limitadas",
    descricao: "Acompanhamento 1:1 para arrematar com segurança. Estratégia de lance, due diligence completa, acesso aos bastidores e suporte pós-arrematação.",
    cor: "#ffd700",
    icone: "🏆",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-4 bg-[#16213e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Como funciona o{" "}
            <span className="text-gradient">Alerta Leilões PB</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg max-w-2xl mx-auto">
            Três níveis de acesso para cada momento da sua jornada em leilões imobiliários
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {niveis.map((nivel) => (
            <Card
              key={nivel.numero}
              className={nivel.destaque ? "border-[#e63946]/50 ring-1 ring-[#e63946]/20" : ""}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{nivel.icone}</span>
                  <span className="text-5xl font-black opacity-20" style={{ color: nivel.cor }}>
                    {nivel.numero}
                  </span>
                </div>
                {nivel.destaque && (
                  <span className="inline-block bg-[#e63946]/20 text-[#e63946] text-xs font-bold px-3 py-1 rounded-full border border-[#e63946]/30">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold">{nivel.titulo}</h3>
                <p className="text-sm font-medium" style={{ color: nivel.cor }}>{nivel.subtitulo}</p>
                <p className="text-[#a0a0a0] text-sm leading-relaxed">{nivel.descricao}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
