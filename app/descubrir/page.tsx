import type { Metadata } from "next";
import { DiscoverClient } from "@/components/DiscoverClient";

export const metadata: Metadata = { title: "Descubrir talento" };

export default function DescubrirPage() {
  return (
    <main>
      <section className="page-hero"><div className="shell"><span className="eyebrow">DESCUBRÍ NICARAGUA</span><h1>Encontrá habilidades, servicios y emprendimientos.</h1><p>Buscá por categoría, ciudad o lo que necesitás resolver. Esta versión usa perfiles demostrativos mientras conectamos la base de datos real.</p></div></section>
      <section className="section"><div className="shell"><DiscoverClient /></div></section>
    </main>
  );
}
