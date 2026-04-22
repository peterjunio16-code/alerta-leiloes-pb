import Link from "next/link";
import { RADAR_CHECKOUT_URL } from "@/lib/constants";

const CHECKOUT_URL = RADAR_CHECKOUT_URL;

export function CTAFinal() {
  return (
    <section className="py-24 px-4 bg-night-900 relative overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,150,42,0.06),transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">

        <div className="space-y-4">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-gold-light/70 px-4 py-1.5 border border-gold/20 rounded-full">
            Comece agora
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Cada semana sem informação{" "}
            <span className="text-gradient-gold">é uma oportunidade que passa</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
            Entre no grupo gratuito, comece a acompanhar oportunidades reais e decida no seu tempo se quer evoluir para o Radar PB.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/grupo"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-xl transition-all cta-glow text-base"
          >
            Entrar no Grupo Gratuito
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-gold/30 hover:bg-gold/5 text-gold-light font-semibold py-4 px-10 rounded-xl transition-colors text-base"
          >
            ⭐ Assinar Radar PB
          </a>
        </div>

        <p className="text-slate-500 text-xs">
          Grupo gratuito sem compromisso • Radar PB cancele quando quiser • Sem contrato
        </p>
      </div>
    </section>
  );
}
