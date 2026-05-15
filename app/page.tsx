import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ConfiancaBar } from "@/components/landing/ConfiancaBar";
import { PainSection } from "@/components/landing/PainSection";
import { SemVsCom } from "@/components/landing/SemVsCom";
import { MockupWhatsApp } from "@/components/landing/MockupWhatsApp";
import { ScoreVisual } from "@/components/landing/ScoreVisual";
import { SimuladorOportunidade } from "@/components/landing/SimuladorOportunidade";
import { ComparacaoInvestimento } from "@/components/landing/ComparacaoInvestimento";
import { Planos } from "@/components/landing/Planos";
import { ProvasSocial } from "@/components/landing/ProvasSocial";
import { BlogPreview } from "@/components/landing/BlogPreview";
import { FAQ } from "@/components/landing/FAQ";
import { SegurancaJuridica } from "@/components/landing/SegurancaJuridica";
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
        <SemVsCom />
        <MockupWhatsApp />
        <ScoreVisual />
        <SimuladorOportunidade />
        <ComparacaoInvestimento />
        <Planos />
        <ProvasSocial />
        <BlogPreview />
        <FAQ />
        <SegurancaJuridica />
        <CTAFinal />
        <Footer />
      </main>
      <WhatsAppFloating />
    </>
  );
}
