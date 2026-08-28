import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./brand.css";
import "./firebase.css";
import "./profile.css";
import "./home-hero.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Germina | Donde el talento crece", template: "%s | Germina" },
  description: "Plataforma nicaragüense para descubrir, promocionar y conectar talento, habilidades y emprendimientos.",
  icons: {
    icon: "/germina-logo.svg",
    shortcut: "/germina-logo.svg",
    apple: "/germina-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${manrope.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
