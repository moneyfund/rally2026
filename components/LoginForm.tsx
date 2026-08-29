"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import { signInWithGoogle } from "@/lib/google-auth";

const ADMIN_EMAIL = "norvingarcia220@gmail.com";

function isAdminEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function completeSignIn(user: { uid: string; email: string | null }) {
    if (isAdminEmail(user.email)) {
      router.replace("/admin");
      router.refresh();
      return;
    }

    const [account, profile] = await Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDoc(doc(db, "profiles", user.uid)),
    ]);

    if (!profile.exists()) {
      router.replace("/crear-perfil?google=1");
      return;
    }

    const accountType = String(account.data()?.accountType ?? profile.data().kind ?? "persona");
    if (accountType === "empresa" || profile.data().kind === "empresa") {
      router.replace("/mi-empresa");
      router.refresh();
      return;
    }

    router.replace("/mi-perfil");
    router.refresh();
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
      await completeSignIn(credential.user);
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
      await completeSignIn(user);
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <span className="eyebrow">ENTRAR A GERMINA</span>
      <h2>Bienvenido de vuelta.</h2>
      <p>Entrá a tu espacio de talento, emprendimiento, empresa o administración.</p>

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
      <small>¿Todavía no tenés cuenta? <Link href="/crear-perfil">Creala gratis</Link></small>
    </>
  );
}
