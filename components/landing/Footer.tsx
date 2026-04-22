import Link from "next/link";
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from "@/lib/constants";

const links = {
  acesso: [
    { label: "Grupo Gratuito", href: "/grupo" },
    { label: "Radar PB — Assinatura", href: "/radar" },
    { label: "Mentoria Lance Certo", href: "/mentoria" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Sobre a plataforma", href: "#como-funciona" },
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Planos e preços", href: "#planos" },
    { label: "Perguntas frequentes", href: "#faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-night-950 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(196,150,42,0.03),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main footer content */}
        <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center">
                <span className="text-base">🏠</span>
              </div>
              <div>
                <p className="font-black text-white text-base leading-none">ALERTA LEILÕES PB</p>
                <p className="text-gold-light text-xs mt-0.5 font-medium">Inteligência Imobiliária</p>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Plataforma de curadoria e inteligência de leilões imobiliários na Paraíba.
              Ajudamos investidores a identificar oportunidades com análise de oportunidade, risco e potencial de retorno.
            </p>

            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-gold">📍</span>
                <span>João Pessoa, Paraíba — Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold">📱</span>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>

            {/* Member count badge */}
            <div className="inline-flex items-center gap-2 bg-night-800 border border-white/[0.08] rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-300 text-xs font-medium">+500 membros no grupo gratuito</span>
            </div>
          </div>

          {/* Links: Acesso */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold/70">Acesso</h4>
            <ul className="space-y-2.5">
              {links.acesso.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Plataforma */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-gold/70">Plataforma</h4>
            <ul className="space-y-2.5">
              {links.legal.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Alerta Leilões PB. Todos os direitos reservados.
          </p>
          <p className="text-slate-600 text-xs text-center sm:text-right max-w-sm">
            Plataforma educativa e de curadoria. Não somos corretores, advogados ou consultores de investimentos. Informações para fins educacionais.
          </p>
        </div>
      </div>
    </footer>
  );
}
