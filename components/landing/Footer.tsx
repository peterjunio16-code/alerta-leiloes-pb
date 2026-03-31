import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0f3460] border-t border-[#16213e] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Alerta Leilões PB</h3>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Inteligência imobiliária para quem quer arrematar com segurança na Paraíba.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Acesso</h4>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li><Link href="/grupo" className="hover:text-white transition-colors">Grupo Gratuito</Link></li>
              <li><Link href="/radar" className="hover:text-white transition-colors">Radar PB — R$197/mês</Link></li>
              <li><Link href="/mentoria" className="hover:text-white transition-colors">Mentoria Lance Certo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li>WhatsApp: (83) 9 9999-9999</li>
              <li>alertaleiloespb@gmail.com</li>
              <li>João Pessoa, PB</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#1a1a2e] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#a0a0a0]">
          <p>© 2026 Alerta Leilões PB. Todos os direitos reservados.</p>
          <p>Informações educacionais. Não constitui consultoria de investimento.</p>
        </div>
      </div>
    </footer>
  );
}
