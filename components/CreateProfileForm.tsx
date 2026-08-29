"use client";

import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signOut, updateProfile, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import { signInWithGoogle } from "@/lib/google-auth";
import type { ProfileKind } from "@/lib/profile-types";

const profileCategories = ["Diseño", "Tecnología", "Fotografía", "Gastronomía", "Artesanía", "Servicios"];
const ventureCategories = ["Agroindustria", "Economía circular", "Alimentos y bebidas", "Agricultura", "Artesanía", "Comercio", "Industria creativa", "Moda", "Servicios", "Tecnología", "Turismo", "Otros"];
const companyCategories = ["Tecnología", "Construcción", "Finanzas", "Comercio", "Servicios profesionales", "Industria", "Turismo", "Educación", "Salud", "Logística", "Otros"];
const ventureNeedsOptions = ["Clientes", "Alianzas comerciales", "Proveedores", "Financiamiento", "Espacios para comercialización", "Instituciones interesadas"];

function routeForKind(kind: ProfileKind) {
  return kind === "empresa" ? "/mi-empresa" : "/mi-perfil";
}

export function CreateProfileForm() {
  const [kind, setKind] = useState<ProfileKind>("persona");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || new URLSearchParams(window.location.search).get("google") !== "1") return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user || !user.providerData.some((provider) => provider.providerId === "google.com")) return;
      const existingProfile = await getDoc(doc(db, "profiles", user.uid));
      if (existingProfile.exists()) {
        const existingKind = existingProfile.data().kind === "empresa" ? "empresa" : existingProfile.data().kind === "negocio" ? "negocio" : "persona";
        window.location.replace(routeForKind(existingKind));
        return;
      }
      setGoogleUser(user);
      setRegisteredEmail(user.email ?? "");
    });
  }, []);

  async function connectGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      const existingProfile = await getDoc(doc(db, "profiles", user.uid));
      if (existingProfile.exists()) {
        const existingKind = existingProfile.data().kind === "empresa" ? "empresa" : existingProfile.data().kind === "negocio" ? "negocio" : "persona";
        window.location.assign(routeForKind(existingKind));
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
      const legalName = String(form.get("legalName") ?? "").trim();
      const companyEmail = String(form.get("companyEmail") ?? email).trim().toLowerCase();
      const website = String(form.get("website") ?? "").trim();
      const representativeName = String(form.get("representativeName") ?? "").trim();
      const representativeRole = String(form.get("representativeRole") ?? "").trim();
      const skills = String(form.get("skills") ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      const ventureProductNames = String(form.get("products") ?? "")
        .split(",")
        .map((product) => product.trim())
        .filter(Boolean);
      const ventureNeeds = form.getAll("ventureNeeds").map(String);
      const products = kind === "negocio" ? ventureProductNames.map((productName) => ({
        id: crypto.randomUUID(),
        name: productName,
        description: "",
        price: "",
        availability: "Consultar disponibilidad",
        imageUrl: "",
        storagePath: "",
      })) : [];

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
        ...(kind === "empresa" ? {
          legalName,
          companyEmail,
          website,
          representativeName,
          representativeRole,
        } : {}),
        category,
        profession: headline,
        location,
        phone,
        headline,
        description,
        skills,
        services: skills,
        socialLinks: {
          website,
          whatsapp: phone,
          facebook: "",
          instagram: "",
          tiktok: "",
        },
        avatarUrl: "",
        googlePhotoUrl: user.photoURL ?? "",
        coverUrl: "",
        portfolio: [],
        available: kind !== "empresa",
        verified: false,
        verificationStatus: "pending",
        verificationNote: "",
        partner: false,
        status: "active",
        coordinates: null,
        locationPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      profileSaved = true;

      if (kind === "negocio") {
        try {
          await setDoc(profileRef, {
            products,
            ventureNeeds,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (enrichmentError) {
          console.warn("El perfil base fue creado, pero Firebase rechazó temporalmente los campos avanzados del emprendimiento.", enrichmentError);
        }
      }

      setRegisteredEmail(email);
      setSubmitted(true);
    } catch (caught) {
      if (createdUser && !profileSaved) {
        try {
          await deleteUser(createdUser);
        } catch {
          // Preserve the original Firebase error.
        }
      }
      setError(firebaseMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const isCompany = kind === "empresa";
    return (
      <div className="success-card">
        <CheckCircle2 size={42} />
        <h2>{isCompany ? "Solicitud empresarial recibida." : "Tu cuenta de Germina está lista."}</h2>
        <p>{isCompany ? <>La cuenta <strong>{registeredEmail}</strong> quedó creada. Administración revisará la empresa antes de habilitar vacantes y publicación pública.</> : <>Tu acceso <strong>{registeredEmail}</strong> quedó conectado y tu perfil fue guardado.</>}</p>
        <a className="btn btn-primary" href={routeForKind(kind)}>{isCompany ? "Ir a Mi empresa" : "Completar mi perfil"}</a>
      </div>
    );
  }

  const categories = kind === "empresa" ? companyCategories : kind === "negocio" ? ventureCategories : profileCategories;

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-type-grid profile-type-grid-three">
        <button type="button" className={kind === "persona" ? "type-card active" : "type-card"} onClick={() => setKind("persona")}><UserRound size={23} /><strong>Soy talento</strong><span>Quiero mostrar mis habilidades y servicios.</span></button>
        <button type="button" className={kind === "negocio" ? "type-card active" : "type-card"} onClick={() => setKind("negocio")}><BriefcaseBusiness size={23} /><strong>Tengo un emprendimiento</strong><span>Quiero mostrar productos, servicios y lo que estoy buscando.</span></button>
        <button type="button" className={kind === "empresa" ? "type-card active" : "type-card"} onClick={() => setKind("empresa")}><Building2 size={23} /><strong>Represento una empresa</strong><span>Quiero publicar vacantes y gestionar postulaciones.</span></button>
      </div>

      <div className="form-section-title"><span>1</span><div><strong>Datos de acceso</strong><small>Elegí Google o correo y contraseña para crear tu cuenta.</small></div></div>

      {googleUser ? (
        <div className="google-connected-card"><span className="google-auth-mark" aria-hidden="true">G</span><div><strong>Cuenta de Google conectada</strong><small>{googleUser.email}</small></div><button type="button" onClick={disconnectGoogle}>Usar otro método</button></div>
      ) : (
        <>
          <button type="button" className="google-auth-button google-auth-button-wide" onClick={connectGoogle} disabled={googleLoading || loading}><span className="google-auth-mark" aria-hidden="true">G</span>{googleLoading ? "Conectando con Google..." : "Continuar con Google"}</button>
          <div className="auth-divider"><span>o creá tu acceso con correo</span></div>
          <div className="form-grid">
            <label className="form-span"><span>Correo electrónico</span><div className="input-icon"><Mail size={16} /><input name="email" required type="email" autoComplete="email" placeholder="tu@correo.com" /></div></label>
            <label><span>Contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="password" required minLength={6} type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" /></div></label>
            <label><span>Confirmar contraseña</span><div className="input-icon"><LockKeyhole size={16} /><input name="confirmPassword" required minLength={6} type="password" autoComplete="new-password" placeholder="Repetí tu contraseña" /></div></label>
          </div>
        </>
      )}

      <div className="form-section-title"><span>2</span><div><strong>{kind === "empresa" ? "Información empresarial" : kind === "negocio" ? "Información del emprendimiento" : "Tu perfil público"}</strong><small>{kind === "empresa" ? "Estos datos serán revisados por administración antes de publicar la empresa." : kind === "negocio" ? "Esta información alimentará la tarjeta y el perfil público de tu emprendimiento." : "Esta información será visible cuando el perfil sea aprobado."}</small></div></div>
      <div className="form-grid">
        <label><span>{kind === "persona" ? "Nombre completo" : kind === "empresa" ? "Nombre comercial" : "Nombre del emprendimiento"}</span><input key={googleUser?.uid ?? "manual-name"} name="name" required defaultValue={googleUser?.displayName ?? ""} placeholder={kind === "persona" ? "Ej. Ana Martínez" : kind === "empresa" ? "Ej. Grupo Horizonte" : "Ej. Biocafé"} /></label>
        <label><span>{kind === "empresa" ? "Sector" : "Categoría"}</span><select name="category" required defaultValue=""><option value="" disabled>Seleccioná una opción</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Ciudad / departamento</span><div className="input-icon"><MapPin size={16} /><input name="location" required placeholder="Ej. Matagalpa" /></div></label>
        <label><span>Teléfono o WhatsApp</span><input name="phone" placeholder="+505 8888 8888" /></label>

        {kind === "empresa" ? (
          <>
            <label className="form-span"><span>Razón social / nombre legal</span><input name="legalName" required placeholder="Nombre registrado legalmente" /></label>
            <label><span>Correo corporativo</span><input name="companyEmail" required type="email" placeholder="rrhh@empresa.com" /></label>
            <label><span>Sitio web</span><input name="website" placeholder="https://empresa.com" /></label>
            <label><span>Representante</span><input name="representativeName" required placeholder="Nombre de la persona responsable" /></label>
            <label><span>Cargo del representante</span><input name="representativeRole" required placeholder="Ej. Gerente de RRHH" /></label>
            <label className="form-span"><span>Presentación de la empresa</span><input name="headline" required placeholder="Ej. Tecnología nicaragüense enfocada en soluciones financieras" /></label>
            <label className="form-span"><span>Descripción</span><textarea name="description" required rows={5} placeholder="Contanos qué hace la empresa, su cultura y el tipo de talento que busca." /></label>
            <label className="form-span"><span>Áreas de contratación</span><input name="skills" placeholder="Desarrollo, ventas, operaciones, diseño..." /></label>
          </>
        ) : kind === "negocio" ? (
          <>
            <label className="form-span"><span>Propuesta del emprendimiento</span><input name="headline" required placeholder="Ej. Transformamos residuos del café en oportunidades" /></label>
            <label className="form-span"><span>Sobre el emprendimiento</span><textarea name="description" required rows={5} placeholder="Contá la historia, propósito y qué hace diferente a tu emprendimiento." /></label>
            <label className="form-span"><span>Productos principales</span><input name="products" placeholder="Compost, café procesado, cosmética natural..." /><small>Separalos con comas. Después podrás ampliar la información de cada producto.</small></label>
            <label className="form-span"><span>Servicios principales</span><input name="skills" placeholder="Capacitaciones, distribución, diseño, asesoría..." /><small>Separalos con comas.</small></label>
            <div className="form-span venture-registration-needs"><span>¿Qué busca tu emprendimiento?</span><p>Seleccioná las conexiones que podrían ayudarlo a crecer.</p><div>{ventureNeedsOptions.map((item) => <label key={item}><input type="checkbox" name="ventureNeeds" value={item} /><span>{item}</span></label>)}</div></div>
          </>
        ) : (
          <>
            <label className="form-span"><span>¿Qué hacés?</span><input name="headline" required placeholder="Ej. Diseño identidades visuales para pequeños negocios" /></label>
            <label className="form-span"><span>Contanos sobre tu trabajo</span><textarea name="description" required rows={5} placeholder="Describí tu experiencia, lo que ofrecés y qué tipo de oportunidades buscás." /></label>
            <label className="form-span"><span>Habilidades principales</span><input name="skills" placeholder="Branding, fotografía, repostería..." /></label>
          </>
        )}
      </div>

      {kind === "empresa" ? <div className="company-registration-note"><Building2 size={19} /><div><strong>Verificación empresarial obligatoria</strong><span>Después de crear la cuenta podrás subir documentación en “Mi empresa”. Las vacantes se habilitan únicamente cuando administración aprueba la solicitud.</span></div></div> : null}
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="form-footer"><p>{kind === "empresa" ? "La información empresarial permanece fuera del directorio público hasta ser aprobada." : "Los perfiles nuevos pasan por revisión antes de aparecer públicamente."}</p><button className="btn btn-primary btn-lg" type="submit" disabled={loading || googleLoading}>{loading ? "Creando cuenta..." : <>Crear cuenta {kind === "empresa" ? "empresarial" : "y perfil"} <ArrowRight size={18} /></>}</button></div>
    </form>
  );
}
