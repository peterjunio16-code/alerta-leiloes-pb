export function SegurancaJuridica() {
  return (
    <section className="py-14 px-4 bg-night-950 border-t border-white/[0.05]">
      <div className="max-w-3xl mx-auto">
        <div className="bg-night-800/30 border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
              ⚖️
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm">Transparência e responsabilidade</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                O Alerta Leilões PB é uma <strong className="text-slate-400">plataforma educativa de curadoria e inteligência imobiliária</strong>. Não somos leiloeiros, corretores, advogados ou consultores de investimento. As informações disponibilizadas são <strong className="text-slate-400">preliminares e de caráter educativo</strong>, baseadas em análises de dados públicos e não garantem lucro ou ausência de riscos.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                A decisão de participar de um leilão é <strong className="text-slate-400">sempre e exclusivamente do usuário</strong>. Recomendamos a consulta a profissionais habilitados (advogados, engenheiros, corretores) antes de qualquer arremate. Leilões imobiliários envolvem riscos jurídicos, financeiros e operacionais que devem ser avaliados individualmente.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "leilões de imóveis na Paraíba",
                  "leilão imobiliário João Pessoa",
                  "imóveis de leilão PB",
                  "oportunidades de leilão Paraíba",
                ].map((tag) => (
                  <span key={tag} className="text-[10px] text-slate-600 bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
