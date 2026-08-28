import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Rally | Del hobby al negocio",
  description:
    "Plataforma nicaragüense para descubrir, promocionar y conectar talento joven, habilidades y emprendimientos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
