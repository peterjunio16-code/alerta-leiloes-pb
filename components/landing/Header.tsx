"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Oportunidades", href: "#oportunidades" },
  { label: "Planos", href: "#planos" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-night-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <span className="font-black text-white text-base leading-none">
              ALERTA{" "}
              <span className="text-gradient-gold">LEILÕES PB</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/radar"
              className="text-sm text-gold-light hover:text-white transition-colors font-medium"
            >
              Radar PB
            </Link>
            <Link
              href="/grupo"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cta-glow"
            >
              Entrar Grátis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/[0.06] py-4 space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-2 py-3 text-slate-300 hover:text-white text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/radar"
                onClick={() => setOpen(false)}
                className="block text-center border border-gold/30 text-gold-light py-3 rounded-xl text-sm font-medium hover:bg-gold/5 transition-colors"
              >
                ⭐ Conhecer o Radar PB
              </Link>
              <Link
                href="/grupo"
                onClick={() => setOpen(false)}
                className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
              >
                Entrar no Grupo Gratuito
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
