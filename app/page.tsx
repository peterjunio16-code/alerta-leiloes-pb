import { Hero } from "@/components/landing/Hero";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { ProvasSocial } from "@/components/landing/ProvasSocial";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ComoFunciona />
      <ProvasSocial />
      <Footer />
    </main>
  );
}
