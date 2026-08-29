import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/CreateProfileForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function CrearPerfilPage() {
  return (
    <main>
      <section className="page-hero"><div className="shell"><span className="eyebrow">EMPEZÁ A GERMINAR</span><h1>Creá tu espacio como talento, emprendimiento o empresa.</h1><p>Elegí el tipo de cuenta, completá la información esencial y entrá al flujo de verificación de Germina. Las empresas aprobadas podrán publicar vacantes y gestionar postulaciones.</p></div></section>
      <section className="section"><div className="shell form-shell"><CreateProfileForm /></div></section>
    </main>
  );
}
