import type { Metadata } from "next";
import { Sprout } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-story">
          <span className="auth-story-mark"><Sprout size={28} /></span>
          <span className="eyebrow eyebrow-light">VOLVÉ A TU ESPACIO</span>
          <h1>Seguí haciendo crecer tu perfil.</h1>
          <p>Tu acceso ya está conectado con Firebase Authentication para que cada persona y emprendimiento tenga su propia cuenta.</p>
        </section>
        <section className="auth-card">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
