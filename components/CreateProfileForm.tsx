"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { createUserWithEmailAndPassword, deleteUser, updateProfile, type User } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";

export function CreateProfileForm() {
  const [kind, setKind] = useState<"persona" | "negocio">("persona");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    let createdUser: User | null = null;
    let profileSaved = false;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = credential.user;
      const uid = credential.user.uid;
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

      await updateProfile(credential.user, { displayName: name });

      const batch = writeBatch(db);
      batch.set(doc(db, "users", uid), {
        uid,
        email,
        displayName: name,
        accountType: kind,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "profiles", uid), {
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
          // If cleanup fails, the original Firebase error is still the useful one to show.
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
        <p>Registramos <strong>{registeredEmail}</strong> en Firebase Authentication y guardamos tu perfil en Firestore.</p>
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
        <div><strong>Datos de acceso</strong><small>Este correo y contraseña serán los que usarás para entrar a Germina.</small></div>
      </div>
      <div className="form-grid">
        <label className="form-span"><span>Correo electrónico</span><div className="input-icon"><Mail size={16} /><input name="email" required type="email" autoComplete="email" placeholder="tu@correo.com" /></div></label>
        <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="password" required minLength={6} type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" /></div></label>
        <label><span>Confirmar contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="confirmPassword" required minLength={6} type="password" autoComplete="new-password" placeholder="Repetí tu contraseña" /></div></label>
      </div>

      <div className="form-section-title">
        <span>2</span>
        <div><strong>Tu perfil público</strong><small>Esta información será visible para personas y empresas que busquen talento.</small></div>
      </div>
      <div className="form-grid">
        <label><span>{kind === "persona" ? "Nombre completo" : "Nombre del negocio"}</span><input name="name" required placeholder={kind === "persona" ? "Ej. Ana Martínez" : "Ej. Taller Norte"} /></label>
        <label><span>Categoría</span><select name="category" required defaultValue=""><option value="" disabled>Seleccioná una categoría</option><option>Diseño</option><option>Tecnología</option><option>Fotografía</option><option>Gastronomía</option><option>Artesanía</option><option>Servicios</option></select></label>
        <label><span>Ciudad / departamento</span><div className="input-icon"><MapPin size={16} /><input name="location" required placeholder="Ej. Managua" /></div></label>
        <label><span>Teléfono o WhatsApp</span><input name="phone" placeholder="+505 8888 8888" /></label>
        <label className="form-span"><span>¿Qué hacés?</span><input name="headline" required placeholder="Ej. Diseño identidades visuales para pequeños negocios" /></label>
        <label className="form-span"><span>Contanos sobre tu trabajo</span><textarea name="description" required rows={5} placeholder="Describí tu experiencia, lo que ofrecés y qué tipo de oportunidades buscás." /></label>
        <label className="form-span"><span>Habilidades principales</span><input name="skills" placeholder="Branding, fotografía, repostería..." /></label>
      </div>

      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="form-footer"><p>Al crear tu cuenta aceptás formar parte de la versión inicial de Germina.</p><button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? "Creando cuenta..." : <>Crear cuenta y perfil <ArrowRight size={18} /></>}</button></div>
    </form>
  );
}
