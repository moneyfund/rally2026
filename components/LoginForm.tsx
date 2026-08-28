"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import { signInWithGoogle } from "@/lib/google-auth";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function completeSignIn(uid: string) {
    const profile = await getDoc(doc(db, "profiles", uid));
    if (!profile.exists()) {
      router.push("/crear-perfil?google=1");
      return;
    }
    setSuccess(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await completeSignIn(credential.user.uid);
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      await completeSignIn(user.uid);
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-success">
        <CheckCircle2 size={38} />
        <h2>Sesión iniciada.</h2>
        <p>Ya podés administrar tu cuenta de Germina.</p>
        <Link href="/descubrir" className="btn btn-primary btn-lg">Continuar a Germina <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <>
      <span className="eyebrow">ENTRAR A GERMINA</span>
      <h2>Bienvenido de vuelta.</h2>
      <p>Accedé para administrar tu perfil y tus oportunidades.</p>

      <button type="button" className="google-auth-button" onClick={handleGoogle} disabled={googleLoading || loading}>
        <span className="google-auth-mark" aria-hidden="true">G</span>
        {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
      </button>

      <div className="auth-divider"><span>o continuá con correo</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label><span>Correo</span><div className="input-icon"><Mail size={16} /><input name="email" required type="email" autoComplete="email" placeholder="tu@correo.com" /></div></label>
        <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="password" required type="password" autoComplete="current-password" placeholder="••••••••" /></div></label>
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || googleLoading}>{loading ? "Entrando..." : <>Entrar <ArrowRight size={18} /></>}</button>
      </form>
      <small>¿Todavía no tenés perfil? <Link href="/crear-perfil">Crealo gratis</Link></small>
    </>
  );
}
