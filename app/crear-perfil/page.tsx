import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/CreateProfileForm";

export const metadata: Metadata = { title: "Crear perfil" };

export default function CrearPerfilPage() {
  return (
    <main>
      <section className="page-hero"><div className="shell"><span className="eyebrow">EMPEZÁ A GERMINAR</span><h1>Convertí tu habilidad o emprendimiento en un perfil visible.</h1><p>Creá tu cuenta con correo y contraseña, completá la información básica y guardá tu perfil directamente en Firebase.</p></div></section>
      <section className="section"><div className="shell form-shell"><CreateProfileForm /></div></section>
    </main>
  );
}
