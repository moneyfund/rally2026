import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/CreateProfileForm";
import "./crear-perfil.css";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function CrearPerfilPage() {
  return (
    <main>
      <section className="create-profile-hero">
        <div className="shell">
          <span className="eyebrow">EMPEZÁ A GERMINAR</span>
          <p>
            Elegí el tipo de cuenta, completá la información esencial y entrá al flujo de verificación de Germina. Las empresas aprobadas podrán publicar vacantes y gestionar postulaciones.
          </p>
        </div>
      </section>

      <section className="create-profile-video-stage" aria-label="Video de introducción">
        <div className="create-profile-video-frame">
          <video autoPlay muted playsInline preload="auto">
            <source src="/germina-crear-perfil.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section className="section create-profile-form-section">
        <div className="shell form-shell">
          <CreateProfileForm />
        </div>
      </section>
    </main>
  );
}
