"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess(true);
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-success">
        <CheckCircle2 size={38} />
        <h2>Sesión iniciada.</h2>
        <p>Firebase Authentication confirmó tus credenciales.</p>
        <Link href="/descubrir" className="btn btn-primary btn-lg">Continuar a Germina <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <>
      <span className="eyebrow">ENTRAR A GERMINA</span>
      <h2>Bienvenido de vuelta.</h2>
      <p>Accedé para administrar tu perfil y tus oportunidades.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label><span>Correo</span><div className="input-icon"><Mail size={16} /><input name="email" required type="email" autoComplete="email" placeholder="tu@correo.com" /></div></label>
        <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="password" required type="password" autoComplete="current-password" placeholder="••••••••" /></div></label>
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Entrando..." : <>Entrar <ArrowRight size={18} /></>}</button>
      </form>
      <small>¿Todavía no tenés perfil? <Link href="/crear-perfil">Crealo gratis</Link></small>
    </>
  );
}
