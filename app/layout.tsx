import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alerta Leilões PB — Inteligência Imobiliária",
  description:
    "Receba alertas de imóveis em leilão na Paraíba com desconto de até 70%. Filtrados, analisados e direto no seu WhatsApp.",
  openGraph: {
    title: "Alerta Leilões PB",
    description: "Inteligência Imobiliária para leilões na Paraíba",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-[#1a1a2e] text-[#e0e0e0] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
