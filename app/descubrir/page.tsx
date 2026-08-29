import type { Metadata } from "next";
import { DiscoverClient } from "@/components/DiscoverClient";
import "./discover-actions.css";

export const metadata: Metadata = {
  title: "Descubrir",
  description: "Descubrí talentos, emprendimientos, empresas verificadas y vacantes en Germina.",
};

export default function DescubrirPage() {
  return <main className="discover-v2-page"><section className="section"><div className="shell"><DiscoverClient /></div></section></main>;
}
