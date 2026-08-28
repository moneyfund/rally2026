import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/CreateProfileForm";

export const metadata: Metadata = { title: "Crear perfil" };

export default function CrearPerfilPage() {
  return (
    <main>
      <section className="page-hero"><div className="shell"><span className="eyebrow">EMPEZÁ A GERMINAR</span><h1>Convertí tu habilidad o emprendimiento en un perfil visible.</h1><p>Completá la información básica. Luego conectaremos este flujo con Firebase para guardar datos reales, fotos, portafolio y ubicación.</p></div></section>
      <section className="section"><div className="shell form-shell"><CreateProfileForm /></div></section>
    </main>
  );
}
