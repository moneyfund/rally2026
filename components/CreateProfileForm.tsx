"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signOut, updateProfile, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import { signInWithGoogle } from "@/lib/google-auth";

export function CreateProfileForm() {
  const [kind, setKind] = useState<"persona" | "negocio">("persona");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || new URLSearchParams(window.location.search).get("google") !== "1") return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.providerData.some((provider) => provider.providerId === "google.com")) return;
      const existingProfile = await getDoc(doc(db, "profiles", user.uid));
      if (existingProfile.exists()) {
        window.location.replace("/descubrir");
        return;
      }
      setGoogleUser(user);
      setRegisteredEmail(user.email ?? "");
    });

    return unsubscribe;
  }, []);

  async function connectGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      const existingProfile = await getDoc(doc(db, "profiles", user.uid));
      if (existingProfile.exists()) {
        window.location.assign("/descubrir");
        return;
      }
      setGoogleUser(user);
      setRegisteredEmail(user.email ?? "");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function disconnectGoogle() {
    await signOut(auth);
    setGoogleUser(null);
    setRegisteredEmail("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const emailFromForm = String(form.get("email") ?? "").trim().toLowerCase();

    if (!googleUser && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    let createdUser: User | null = null;
    let profileSaved = false;

    try {
      let user = googleUser;
      if (!user) {
        const credential = await createUserWithEmailAndPassword(auth, emailFromForm, password);
        createdUser = credential.user;
        user = credential.user;
      }

      const uid = user.uid;
      const email = (user.email ?? emailFromForm).trim().toLowerCase();
      const name = String(form.get("name") ?? "").trim();
      const category = String(form.get("category") ?? "");
      const location = String(form.get("location") ?? "").trim();
      const phone = String(form.get("phone") ?? "").trim();
      const headline = String(form.get("headline") ?? "").trim();
      const description = String(form.get("description") ?? "").trim();
      const skills = String(form.get("skills") ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const userRef = doc(db, "users", uid);
      const profileRef = doc(db, "profiles", uid);
      const [existingUser, existingProfile] = await Promise.all([getDoc(userRef), getDoc(profileRef)]);

      if (existingProfile.exists()) {
        profileSaved = true;
        setRegisteredEmail(email);
        setSubmitted(true);
        return;
      }

      await updateProfile(user, { displayName: name });

      const batch = writeBatch(db);
      batch.set(userRef, {
        uid,
        email,
        displayName: name,
        accountType: kind,
        createdAt: existingUser.exists() ? (existingUser.data().createdAt ?? serverTimestamp()) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(profileRef, {
        ownerId: uid,
        kind,
        name,
        category,
        location,
        phone,
        headline,
        description,
        skills,
        available: true,
        verified: false,
        status: "active",
        coordinates: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      profileSaved = true;

      setRegisteredEmail(email);
      setSubmitted(true);
    } catch (caught) {
      if (createdUser && !profileSaved) {
        try {
          await deleteUser(createdUser);
        } catch {
          // Keep the original Firebase error as the useful message for the user.
        }
      }
      setError(firebaseMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="success-card">
        <CheckCircle2 size={42} />
        <h2>Tu cuenta de Germina está lista.</h2>
        <p>Tu acceso <strong>{registeredEmail}</strong> quedó conectado y tu perfil fue guardado en Firestore.</p>
        <a className="btn btn-primary" href="/descubrir">Explorar Germina</a>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-type-grid">
        <button type="button" className={kind === "persona" ? "type-card active" : "type-card"} onClick={() => setKind("persona")}><UserRound size={23} /><strong>Soy talento</strong><span>Quiero mostrar mis habilidades y servicios.</span></button>
        <button type="button" className={kind === "negocio" ? "type-card active" : "type-card"} onClick={() => setKind("negocio")}><BriefcaseBusiness size={23} /><strong>Tengo un negocio</strong><span>Quiero promocionar mi emprendimiento.</span></button>
      </div>

      <div className="form-section-title">
        <span>1</span>
        <div><strong>Datos de acceso</strong><small>Elegí Google o correo y contraseña. No necesitás Google para usar Germina.</small></div>
      </div>

      {googleUser ? (
        <div className="google-connected-card">
          <span className="google-auth-mark" aria-hidden="true">G</span>
          <div><strong>Cuenta de Google conectada</strong><small>{googleUser.email}</small></div>
          <button type="button" onClick={disconnectGoogle}>Usar otro método</button>
        </div>
      ) : (
        <>
          <button type="button" className="google-auth-button google-auth-button-wide" onClick={connectGoogle} disabled={googleLoading || loading}>
            <span className="google-auth-mark" aria-hidden="true">G</span>
            {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
          </button>
          <div className="auth-divider"><span>o creá tu acceso con correo</span></div>
          <div className="form-grid">
            <label className="form-span"><span>Correo electrónico</span><div className="input-icon"><Mail size={16} /><input name="email" required type="email" autoComplete="email" placeholder="tu@correo.com" /></div></label>
            <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="password" required minLength={6} type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" /></div></label>
            <label><span>Confirmar contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="confirmPassword" required minLength={6} type="password" autoComplete="new-password" placeholder="Repetí tu contraseña" /></div></label>
          </div>
        </>
      )}

      <div className="form-section-title">
        <span>2</span>
        <div><strong>Tu perfil público</strong><small>Esta información será visible para personas y empresas que busquen talento.</small></div>
      </div>
      <div className="form-grid">
        <label><span>{kind === "persona" ? "Nombre completo" : "Nombre del negocio"}</span><input key={googleUser?.uid ?? "manual-name"} name="name" required defaultValue={googleUser?.displayName ?? ""} placeholder={kind === "persona" ? "Ej. Ana Martínez" : "Ej. Taller Norte"} /></label>
        <label><span>Categoría</span><select name="category" required defaultValue=""><option value="" disabled>Seleccioná una categoría</option><option>Diseño</option><option>Tecnología</option><option>Fotografía</option><option>Gastronomía</option><option>Artesanía</option><option>Servicios</option></select></label>
        <label><span>Ciudad / departamento</span><div className="input-icon"><MapPin size={16} /><input name="location" required placeholder="Ej. Managua" /></div></label>
        <label><span>Teléfono o WhatsApp</span><input name="phone" placeholder="+505 8888 8888" /></label>
        <label className="form-span"><span>¿Qué hacés?</span><input name="headline" required placeholder="Ej. Diseño identidades visuales para pequeños negocios" /></label>
        <label className="form-span"><span>Contanos sobre tu trabajo</span><textarea name="description" required rows={5} placeholder="Describí tu experiencia, lo que ofrecés y qué tipo de oportunidades buscás." /></label>
        <label className="form-span"><span>Habilidades principales</span><input name="skills" placeholder="Branding, fotografía, repostería..." /></label>
      </div>

      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="form-footer"><p>Explorar Germina es público. Para crear o modificar información sí necesitamos una cuenta.</p><button className="btn btn-primary btn-lg" type="submit" disabled={loading || googleLoading}>{loading ? "Guardando perfil..." : <>Crear cuenta y perfil <ArrowRight size={18} /></>}</button></div>
    </form>
  );
}
