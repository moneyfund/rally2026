import type { Metadata } from "next";
import { MapPinned, Navigation, ShieldCheck } from "lucide-react";
import { RealMap } from "@/components/RealMap";

export const metadata: Metadata = { title: "Mapa de talento" };

export default function MapaPage() {
  return (
    <main>
      <section className="page-hero page-hero-map"><div className="shell"><span className="eyebrow">MAPA DE OPORTUNIDADES</span><h1>El talento de Nicaragua, puesto sobre el mapa.</h1><p>Explorá perfiles por ubicación y descubrí capacidades cerca de vos. El mapa usa OpenStreetMap y no requiere una API paga.</p><div className="hero-feature-row"><span><MapPinned size={16} /> Ubicaciones reales</span><span><Navigation size={16} /> Exploración interactiva</span><span><ShieldCheck size={16} /> Sin costo de API</span></div></div></section>
      <section className="section map-page-section"><div className="shell"><RealMap /></div></section>
    </main>
  );
}
