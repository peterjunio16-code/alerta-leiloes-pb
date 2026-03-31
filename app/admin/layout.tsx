import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/assinantes", label: "Assinantes Radar" },
  { href: "/admin/aplicacoes", label: "Candidaturas" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#1a1a2e]">
      <aside className="w-64 bg-[#16213e] border-r border-[#0f3460] flex flex-col">
        <div className="p-6 border-b border-[#0f3460]">
          <p className="text-xs text-[#a0a0a0] uppercase tracking-wider mb-1">Painel Admin</p>
          <h1 className="text-lg font-bold text-white">Alerta Leilões PB</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-[#a0a0a0] hover:text-white hover:bg-[#0f3460] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#0f3460]">
          <Link href="/" className="text-xs text-[#a0a0a0] hover:text-white">
            ← Ver site público
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
