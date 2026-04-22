import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ConfiancaBar } from "@/components/landing/ConfiancaBar";
import { PainSection } from "@/components/landing/PainSection";
import { Vitrine } from "@/components/landing/Vitrine";
import { ProdutoEmUso } from "@/components/landing/ProdutoEmUso";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Beneficios } from "@/components/landing/Beneficios";
import { Planos } from "@/components/landing/Planos";
import { ProvasSocial } from "@/components/landing/ProvasSocial";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppFloating } from "@/components/ui/WhatsAppFloating";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">
        <Hero />
        <ConfiancaBar />
        <PainSection />
        <Vitrine />
        <ProdutoEmUso />
        <ComoFunciona />
        <Beneficios />
        <Planos />
        <ProvasSocial />
        <FAQ />
        <CTAFinal />
        <Footer />
      </main>
      <WhatsAppFloating />
    </>
  );
}
