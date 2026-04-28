"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { type AdminRole } from "@/lib/admin/users";

type NavItem = { href: string; label: string; icon: string; roles: AdminRole[] };

const navItems: NavItem[] = [
  { href: "/admin",             label: "Dashboard",        icon: "📊", roles: ["super_admin","editor","viewer"] },
  { href: "/admin/leads",       label: "Leads",            icon: "👥", roles: ["super_admin","editor","viewer"] },
  { href: "/admin/imoveis",     label: "Imóveis",          icon: "🏠", roles: ["super_admin","editor","imoveis_only"] },
  { href: "/admin/assinantes",  label: "Assinantes Radar", icon: "🎯", roles: ["super_admin"] },
  { href: "/admin/aplicacoes",  label: "Candidaturas",     icon: "📋", roles: ["super_admin","editor","viewer"] },
  { href: "/admin/blog",        label: "Blog",             icon: "✍️", roles: ["super_admin","editor"] },
  { href: "/admin/usuarios",    label: "Usuários",         icon: "🔐", roles: ["super_admin"] },
];

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: "text-gold bg-gold/10",
  editor: "text-blue-400 bg-blue-400/10",
  viewer: "text-slate-400 bg-slate-400/10",
};

function decodeSessionClient(token: string): { nome: string; role: AdminRole } | null {
  if (token === "authenticated") return { nome: "Admin", role: "super_admin" };
  try {
    const json = atob(token);
    return JSON.parse(json);
  } catch { return null; }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<{ nome: string; role: AdminRole } | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("alerta_admin_session="))
      ?.split("=")[1];
    if (cookie) setSession(decodeSessionClient(decodeURIComponent(cookie)));
  }, []);

  const role = session?.role ?? "viewer";
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-[#16213e] border-b border-[#0f3460] px-4 py-3">
        <div>
          <p className="text-xs text-[#a0a0a0] uppercase tracking-wider">Painel Admin</p>
          <h1 className="text-sm font-bold text-white">Alerta Leilões PB</h1>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-white"
        >
          <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#16213e] border-b border-[#0f3460] px-4 py-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#e63946]/10 text-[#e63946]"
                  : "text-[#a0a0a0] hover:text-white hover:bg-[#0f3460]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <Link href="/" className="block text-xs text-[#a0a0a0] hover:text-white px-3 py-3">
            ← Ver site público
          </Link>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-[#16213e] border-r border-[#0f3460] flex-col min-h-screen">
          {/* Logo + user info */}
          <div className="p-6 border-b border-[#0f3460] space-y-3">
            <div>
              <p className="text-xs text-[#a0a0a0] uppercase tracking-wider mb-1">Painel Admin</p>
              <h1 className="text-lg font-bold text-white">Alerta Leilões PB</h1>
            </div>
            {session && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-xs font-bold text-gold">
                  {session.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{session.nome}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[session.role]}`}>
                    {ROLE_LABELS[session.role]}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#e63946]/10 text-[#e63946] font-medium"
                    : "text-[#a0a0a0] hover:text-white hover:bg-[#0f3460]"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#0f3460] space-y-2">
            <Link href="/" className="block text-xs text-[#a0a0a0] hover:text-white">
              ← Ver site público
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/admin/login", { method: "DELETE" });
                window.location.href = "/admin/login";
              }}
              className="text-xs text-[#e63946] hover:text-red-400"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto min-h-screen">{children}</main>
      </div>
    </div>
  );
}
