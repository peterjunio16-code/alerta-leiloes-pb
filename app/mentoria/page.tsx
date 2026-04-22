import { MentoriaForm } from "@/components/forms/MentoriaForm";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

export const metadata = {
  title: "Mentoria Lance Certo — Alerta Leilões PB",
  description: "Mentoria individual para arrematar com segurança na Paraíba. Vagas limitadas.",
};

export default function MentoriaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#060B18] relative overflow-hidden">
        {/* Background gradients matching landing page */}
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative z-10 pt-28 pb-20 px-4">
          <div className="max-w-2xl mx-auto space-y-10">

            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold-light text-sm font-medium mb-2">
                <span>🏆</span>
                <span>Vagas limitadas</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Mentoria{" "}
                <span className="text-gradient-gold">Lance Certo</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                Acompanhamento individual para quem quer arrematar com segurança,
                estratégia e máximo retorno.
              </p>
            </div>

            {/* What's included */}
            <div className="glass-card rounded-2xl p-8 gold-glow">
              <h2 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                <span className="text-gold">⭐</span>
                O que está incluso:
              </h2>
              <div className="space-y-3">
                {[
                  "Sessões 1:1 com análise do seu perfil de investidor",
                  "Estratégia personalizada de lance",
                  "Due diligence completa do imóvel",
                  "Acesso aos bastidores dos processos judiciais",
                  "Suporte direto no dia do leilão",
                  "Pós-arrematação: imissão de posse e regularização",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-gold font-bold mt-0.5">✓</span>
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form card */}
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="font-bold text-white text-xl">
                  Agende uma conversa gratuita
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Sem compromisso. Entendemos o seu objetivo e te contamos como podemos ajudar.
                </p>
              </div>
              <MentoriaForm />
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
