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

export const metadata: Metadata = {
  title: "Melhores Encontros",
  description: "Organize seus dates e descubra sua melhor conexão.",
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
