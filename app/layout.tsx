import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Caveat } from "next/font/google";
import "./globals.css";
import PinGate from "@/components/PinGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://melhoresencontros.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Melhores Encontros',
    template: '%s | Melhores Encontros',
  },
  description: 'Organize seus dates, avalie cada encontro e descubra quem tem mais conexão com você. Simples, privado e gratuito.',
  keywords: [
    'organizar dates', 'avaliar encontros', 'app de relacionamento',
    'diário de dates', 'melhor conexão afetiva', 'app encontros',
    'namoro', 'encontros', 'match', 'conexão',
  ],
  authors: [{ name: 'Melhores Encontros' }],
  openGraph: {
    title: 'Melhores Encontros',
    description: 'Organize seus dates e descubra quem tem mais conexão com você.',
    url: BASE_URL,
    siteName: 'Melhores Encontros',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melhores Encontros',
    description: 'Organize seus dates e descubra quem tem mais conexão com você.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#faf6f0] dark:bg-gray-950 transition-colors">
        <PinGate>{children}</PinGate>
      </body>
    </html>
  );
}
