import { MentoriaForm } from "@/components/forms/MentoriaForm";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Mentoria Lance Certo — Alerta Leilões PB",
  description: "Mentoria individual para arrematar com segurança na Paraíba. Vagas limitadas.",
};

export default function MentoriaPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="p-4 border-b border-[#16213e]">
        <Link href="/" className="text-[#e63946] font-bold text-lg">← Alerta Leilões PB</Link>
      </nav>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <span className="text-5xl">🏆</span>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Mentoria{" "}
              <span className="text-gradient">Lance Certo</span>
            </h1>
            <p className="text-[#a0a0a0] text-lg">
              Acompanhamento individual para quem quer arrematar com segurança, estratégia e máximo retorno.
            </p>
          </div>

          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 space-y-4">
            <h2 className="font-bold text-white text-lg mb-4">O que está incluso:</h2>
            {[
              "Sessões 1:1 com análise do seu perfil de investidor",
              "Estratégia personalizada de lance",
              "Due diligence completa do imóvel",
              "Acesso aos bastidores dos processos judiciais",
              "Suporte direto no dia do leilão",
              "Pós-arrematação: imissão de posse e regularização",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#e63946] font-bold">✓</span>
                <span className="text-[#e0e0e0] text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8">
            <h2 className="font-bold text-white text-xl mb-6 text-center">
              Preencha sua candidatura
            </h2>
            <MentoriaForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
