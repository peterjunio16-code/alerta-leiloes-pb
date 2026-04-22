import Link from "next/link";
import { WHATSAPP_LINK } from "@/lib/constants";

export function WhatsAppFloating() {
  return (
    <>
      {/* Floating WhatsApp button — desktop bottom-right */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        title="Falar no WhatsApp"
        className="fixed bottom-8 right-6 z-50 group flex items-center gap-3 bg-[#25D366] hover:bg-[#20BF5B] text-white rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] transition-all duration-300 hover:shadow-[0_6px_32px_rgba(37,211,102,0.55)] hover:-translate-y-1"
      >
        <span className="hidden group-hover:block pl-5 text-sm font-bold whitespace-nowrap pr-1">
          Falar no WhatsApp
        </span>
        <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM11.5 2C6.262 2 2 6.262 2 11.5c0 1.932.556 3.733 1.513 5.254L2 21.5l4.746-1.513A9.5 9.5 0 0011.5 21C16.738 21 21 16.738 21 11.5S16.738 2 11.5 2z" />
          </svg>
        </div>
      </a>

      {/* Sticky bottom CTA bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-night-950/95 backdrop-blur-xl border-t border-white/[0.08] p-3 pb-safe">
        <Link
          href="/grupo"
          className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
        >
          Entrar no Grupo Gratuito — Grátis
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </>
  );
}
