import type { Metadata } from "next";
import { CreateProfileForm } from "@/components/CreateProfileForm";
import { CreateProfileIntroVideo } from "@/components/CreateProfileIntroVideo";
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
        <CreateProfileIntroVideo />
      </section>

      <section className="section create-profile-form-section">
        <div className="shell form-shell">
          <CreateProfileForm />
        </div>
      </section>
    </main>
  );
}
