import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, Sprout } from "lucide-react";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-story">
          <span className="auth-story-mark"><Sprout size={28} /></span>
          <span className="eyebrow eyebrow-light">VOLVÉ A TU ESPACIO</span>
          <h1>Seguí haciendo crecer tu perfil.</h1>
          <p>La autenticación real llegará con Firebase. Por ahora esta pantalla deja listo el flujo visual y de navegación.</p>
        </section>
        <section className="auth-card">
          <span className="eyebrow">ENTRAR A GERMINA</span>
          <h2>Bienvenido de vuelta.</h2>
          <p>Accedé para administrar tu perfil y tus oportunidades.</p>
          <form className="auth-form">
            <label><span>Correo</span><div className="input-icon"><Mail size={16} /><input type="email" placeholder="tu@correo.com" /></div></label>
            <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input type="password" placeholder="••••••••" /></div></label>
            <button type="button" className="btn btn-primary btn-lg">Entrar <ArrowRight size={18} /></button>
          </form>
          <small>¿Todavía no tenés perfil? <Link href="/crear-perfil">Crealo gratis</Link></small>
        </section>
      </div>
    </main>
  );
}
