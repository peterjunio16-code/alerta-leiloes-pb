import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-80" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <span className="inline-flex items-center gap-2 bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] px-4 py-1.5 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-[#e63946] rounded-full animate-pulse" />
          Inteligência Imobiliária para Leilões na Paraíba
        </span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
          Imóveis em Leilão com{" "}
          <span className="text-gradient">até 70% de desconto</span>{" "}
          — direto no seu WhatsApp
        </h1>

        <p className="text-lg md:text-xl text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
          Receba alertas filtrados, analisados e com score de oportunidade de
          imóveis em leilão na Paraíba. Sem enrolação, sem juridiquês.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/grupo">
            <Button size="lg" className="w-full sm:w-auto">
              📲 Entrar no Grupo Gratuito
            </Button>
          </Link>
          <Link href="/radar">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Conhecer o Radar PB
            </Button>
          </Link>
        </div>

        <p className="text-[#a0a0a0] text-sm pt-2">
          +500 investidores já recebem alertas • Atualizado toda semana
        </p>
      </div>
    </section>
  );
}
