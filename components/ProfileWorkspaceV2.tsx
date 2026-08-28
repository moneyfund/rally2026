"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe2,
  ImagePlus,
  Instagram,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { onAuthStateChanged, signOut, updateProfile as updateAuthProfile, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { deleteObject, getBlob, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import {
  emptyProfile,
  emptySocialLinks,
  type GerminaProfile,
  type LegalDocument,
  type PortfolioItem,
  type ProfileCoordinates,
} from "@/lib/profile-types";
import { ProfileLocationMap } from "@/components/ProfileLocationMap";

const categories = ["Diseño", "Tecnología", "Fotografía", "Gastronomía", "Artesanía", "Servicios"];

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function readCoordinates(value: unknown): ProfileCoordinates | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return typeof data.lat === "number" && typeof data.lng === "number" ? { lat: data.lat, lng: data.lng } : null;
}

function profileFromData(uid: string, data: Record<string, unknown>, user: User, privateCoordinates: ProfileCoordinates | null): GerminaProfile {
  const base = emptyProfile(uid);
  const social = data.socialLinks && typeof data.socialLinks === "object" ? data.socialLinks as Record<string, unknown> : {};
  const publicCoordinates = readCoordinates(data.coordinates);
  const kind = data.kind === "negocio" ? "negocio" : "persona";
  const legacyBusinessLocation = typeof data.locationPublic !== "boolean" && kind === "negocio" && Boolean(publicCoordinates);

  return {
    ...base,
    ownerId: uid,
    kind,
    name: String(data.name ?? user.displayName ?? ""),
    category: String(data.category ?? "Servicios"),
    profession: String(data.profession ?? data.headline ?? ""),
    headline: String(data.headline ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    coordinates: privateCoordinates ?? publicCoordinates,
    locationPublic: data.locationPublic === true || legacyBusinessLocation,
    phone: String(data.phone ?? ""),
    socialLinks: {
      ...emptySocialLinks,
      website: String(social.website ?? ""),
      whatsapp: String(social.whatsapp ?? data.phone ?? ""),
      facebook: String(social.facebook ?? ""),
      instagram: String(social.instagram ?? ""),
      tiktok: String(social.tiktok ?? ""),
    },
    services: Array.isArray(data.services) ? data.services.map(String) : Array.isArray(data.skills) ? data.skills.map(String) : [],
    avatarUrl: String(data.avatarUrl ?? ""),
    googlePhotoUrl: String(data.googlePhotoUrl ?? user.photoURL ?? ""),
    coverUrl: String(data.coverUrl ?? ""),
    portfolio: Array.isArray(data.portfolio) ? data.portfolio as PortfolioItem[] : [],
    available: data.available !== false,
    verified: Boolean(data.verified),
    status: String(data.status ?? "active"),
  };
}

export function ProfileWorkspaceV2() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingLegal, setUploadingLegal] = useState(false);
  const [profile, setProfile] = useState<GerminaProfile>(emptyProfile());
  const [servicesText, setServicesText] = useState("");
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [legalType, setLegalType] = useState("Identificación");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement | null>(null);
  const legalInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const profileRef = doc(db, "profiles", user!.uid);
        const snapshot = await getDoc(profileRef);
        let privateCoordinates: ProfileCoordinates | null = null;
        try {
          const privateLocation = await getDoc(doc(db, "users", user!.uid, "privateLocation", "current"));
          if (privateLocation.exists()) privateCoordinates = readCoordinates(privateLocation.data().coordinates);
        } catch {
          // Compatibility while the newest Firestore rules are being published.
        }
        const next = snapshot.exists()
          ? profileFromData(user!.uid, snapshot.data(), user!, privateCoordinates)
          : { ...emptyProfile(user!.uid), name: user!.displayName ?? "", googlePhotoUrl: user!.photoURL ?? "" };
        if (!active) return;
        setProfile(next);
        setServicesText(next.services.join(", "));
      } catch (caught) {
        if (active) setError(firebaseMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    const unsubscribeLegal = onSnapshot(
      collection(db, "users", user.uid, "legalDocuments"),
      (snapshot) => {
        if (!active) return;
        setLegalDocuments(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<LegalDocument, "id">) })));
      },
      (caught) => active && setError(firebaseMessage(caught)),
    );

    return () => {
      active = false;
      unsubscribeLegal();
    };
  }, [user, authReady]);

  const avatar = profile.avatarUrl || profile.googlePhotoUrl || user?.photoURL || "";
  const completion = useMemo(() => {
    const checks = [profile.name, profile.profession, profile.description, profile.location, profile.services.length, avatar, profile.coverUrl];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, avatar]);

  function patchProfile<K extends keyof GerminaProfile>(key: K, value: GerminaProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function patchSocial(key: keyof GerminaProfile["socialLinks"], value: string) {
    setProfile((current) => ({ ...current, socialLinks: { ...current.socialLinks, [key]: value } }));
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const services = servicesText.split(",").map((item) => item.trim()).filter(Boolean);
      const profileRef = doc(db, "profiles", user.uid);
      const existing = await getDoc(profileRef);
      const publicCoordinates = profile.locationPublic ? profile.coordinates : null;
      const payload = {
        ownerId: user.uid,
        kind: profile.kind,
        name: profile.name.trim(),
        category: profile.category,
        profession: profile.profession.trim(),
        headline: profile.headline.trim() || profile.profession.trim(),
        description: profile.description.trim(),
        location: profile.location.trim(),
        coordinates: publicCoordinates,
        locationPublic: profile.locationPublic,
        phone: profile.phone.trim(),
        socialLinks: profile.socialLinks,
        services,
        skills: services,
        avatarUrl: profile.avatarUrl,
        googlePhotoUrl: user.photoURL ?? profile.googlePhotoUrl,
        coverUrl: profile.coverUrl,
        portfolio: profile.portfolio,
        available: profile.available,
        verified: existing.exists() ? Boolean(existing.data().verified) : false,
        status: "active",
        updatedAt: serverTimestamp(),
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      };

      await setDoc(profileRef, payload, { merge: true });
      await setDoc(doc(db, "users", user.uid, "privateLocation", "current"), {
        coordinates: profile.coordinates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email ?? "",
        displayName: profile.name.trim(),
        accountType: profile.kind,
        updatedAt: serverTimestamp(),
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });
      if (profile.name.trim() && profile.name.trim() !== user.displayName) {
        await updateAuthProfile(user, { displayName: profile.name.trim() });
      }
      setProfile((current) => ({ ...current, services, googlePhotoUrl: user.photoURL ?? current.googlePhotoUrl }));
      setNotice(profile.locationPublic && profile.coordinates
        ? "Perfil guardado. La ubicación que seleccionaste ahora es pública."
        : "Perfil guardado. Tu punto exacto permanece privado.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("La foto debe ser JPG, PNG o WebP y pesar menos de 5 MB.");
      return;
    }
    setUploadingAvatar(true);
    setError("");
    try {
      const path = `profiles/${user.uid}/avatar/${Date.now()}-${safeFileName(file.name)}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      await setDoc(doc(db, "profiles", user.uid), { avatarUrl: url, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((current) => ({ ...current, avatarUrl: url }));
      setNotice("Foto de perfil actualizada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function uploadCover(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("La portada debe ser JPG, PNG o WebP y pesar menos de 10 MB.");
      return;
    }
    setUploadingCover(true);
    setError("");
    try {
      const path = `profiles/${user.uid}/cover/${Date.now()}-${safeFileName(file.name)}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      await setDoc(doc(db, "profiles", user.uid), { coverUrl: url, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((current) => ({ ...current, coverUrl: url }));
      setNotice("Foto de portada actualizada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setUploadingCover(false);
    }
  }

  async function useGooglePhoto() {
    if (!user?.photoURL) return;
    setProfile((current) => ({ ...current, avatarUrl: "", googlePhotoUrl: user.photoURL ?? "" }));
    await setDoc(doc(db, "profiles", user.uid), { avatarUrl: "", googlePhotoUrl: user.photoURL, updatedAt: serverTimestamp() }, { merge: true });
    setNotice("Volvimos a usar tu foto de Google.");
  }

  async function uploadPortfolio(files: FileList | null) {
    if (!user || !files?.length) return;
    const selected = Array.from(files).slice(0, 8);
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)) {
      setError("Cada imagen del portafolio debe pesar menos de 10 MB.");
      return;
    }
    setUploadingPortfolio(true);
    setError("");
    try {
      const uploaded: PortfolioItem[] = [];
      for (const file of selected) {
        const id = crypto.randomUUID();
        const storagePath = `profiles/${user.uid}/portfolio/${id}-${safeFileName(file.name)}`;
        const fileRef = ref(storage, storagePath);
        await uploadBytes(fileRef, file, { contentType: file.type });
        const url = await getDownloadURL(fileRef);
        uploaded.push({
          id,
          title: portfolioTitle.trim() || file.name.replace(/\.[^.]+$/, ""),
          description: portfolioDescription.trim(),
          url,
          storagePath,
          type: "image",
          createdAt: Date.now(),
        });
      }
      const portfolio = [...profile.portfolio, ...uploaded];
      await setDoc(doc(db, "profiles", user.uid), { portfolio, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((current) => ({ ...current, portfolio }));
      setPortfolioTitle("");
      setPortfolioDescription("");
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
      setNotice(`${uploaded.length} archivo${uploaded.length === 1 ? "" : "s"} agregado${uploaded.length === 1 ? "" : "s"} al portafolio.`);
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setUploadingPortfolio(false);
    }
  }

  async function removePortfolioItem(item: PortfolioItem) {
    if (!user) return;
    setError("");
    try {
      if (item.storagePath) await deleteObject(ref(storage, item.storagePath));
      const portfolio = profile.portfolio.filter((current) => current.id !== item.id);
      await setDoc(doc(db, "profiles", user.uid), { portfolio, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((current) => ({ ...current, portfolio }));
    } catch (caught) {
      setError(firebaseMessage(caught));
    }
  }

  async function uploadLegal(file: File) {
    if (!user) return;
    const allowed = file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png";
    if (!allowed || file.size > 15 * 1024 * 1024) {
      setError("Los documentos legales deben ser PDF, JPG o PNG y pesar menos de 15 MB.");
      return;
    }
    setUploadingLegal(true);
    setError("");
    try {
      const storagePath = `legal/${user.uid}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      await uploadBytes(ref(storage, storagePath), file, { contentType: file.type });
      await addDoc(collection(db, "users", user.uid, "legalDocuments"), {
        fileName: file.name,
        storagePath,
        contentType: file.type,
        size: file.size,
        documentType: legalType,
        createdAt: serverTimestamp(),
      });
      if (legalInputRef.current) legalInputRef.current.value = "";
      setNotice("Documento legal guardado en el área privada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setUploadingLegal(false);
    }
  }

  async function openLegalDocument(item: LegalDocument) {
    try {
      const blob = await getBlob(ref(storage, item.storagePath));
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      setError(firebaseMessage(caught));
    }
  }

  async function removeLegalDocument(item: LegalDocument) {
    if (!user) return;
    try {
      await deleteObject(ref(storage, item.storagePath));
      await deleteDoc(doc(db, "users", user.uid, "legalDocuments", item.id));
      setNotice("Documento eliminado.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    }
  }

  if (!authReady || loading) {
    return <main className="profile-private-page"><div className="profile-loading"><LoaderCircle className="spin" size={28} /> Preparando tu perfil...</div></main>;
  }

  if (!user) {
    return (
      <main className="profile-private-page">
        <section className="profile-auth-gate">
          <span><LockKeyhole size={24} /></span>
          <p className="eyebrow">ÁREA PRIVADA</p>
          <h1>Iniciá sesión para administrar tu perfil.</h1>
          <p>Tu perfil público se puede explorar sin cuenta. Esta zona contiene herramientas privadas de edición y documentos.</p>
          <Link href="/entrar" className="btn btn-primary btn-lg">Entrar a Germina</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-private-page">
      <section
        className={`profile-dashboard-hero ${profile.coverUrl ? "profile-hero-with-cover" : ""}`}
        style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined}
      >
        <div className="shell profile-dashboard-hero-inner">
          <div>
            <span className="eyebrow eyebrow-light">MI PERFIL · GERMINA</span>
            <h1>Tu espacio para crecer.</h1>
            <p>Administrá cómo te ven, qué ofrecés y qué ubicación decidís hacer pública.</p>
          </div>
          <div className="profile-completion-card">
            <span>Perfil completado</span>
            <strong>{completion}%</strong>
            <div><i style={{ width: `${completion}%` }} /></div>
          </div>
        </div>
      </section>

      <div className="shell profile-dashboard-shell">
        <aside className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="profile-avatar-xl">
              {avatar ? <img src={avatar} alt={`Foto de ${profile.name || "perfil"}`} /> : <UserRound size={42} />}
              {profile.verified ? <span className="profile-verified"><BadgeCheck size={17} /></span> : null}
            </div>
            <strong>{profile.name || user.displayName || "Tu perfil"}</strong>
            <span>{profile.profession || profile.category}</span>
            <input ref={avatarInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadAvatar(event.target.files[0])} />
            <button type="button" className="profile-upload-button" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
              <Camera size={16} /> {uploadingAvatar ? "Subiendo..." : "Cambiar foto"}
            </button>
            {user.photoURL && profile.avatarUrl ? <button type="button" className="profile-text-button" onClick={useGooglePhoto}>Usar foto de Google</button> : null}
            <input ref={coverInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadCover(event.target.files[0])} />
            <button type="button" className="profile-upload-button profile-cover-button" disabled={uploadingCover} onClick={() => coverInputRef.current?.click()}>
              <ImagePlus size={16} /> {uploadingCover ? "Subiendo portada..." : profile.coverUrl ? "Cambiar portada" : "Agregar portada"}
            </button>
          </div>

          <nav className="profile-section-nav" aria-label="Secciones del perfil">
            <a href="#informacion"><UserRound size={16} /> Información</a>
            <a href="#ubicacion"><MapPin size={16} /> Ubicación</a>
            <a href="#servicios"><BriefcaseBusiness size={16} /> Servicios</a>
            <a href="#redes"><Globe2 size={16} /> Redes sociales</a>
            <a href="#legal"><ShieldCheck size={16} /> Documentación legal</a>
          </nav>
          <Link href={`/perfil/${user.uid}`} className="profile-preview-link">Ver perfil público <ExternalLink size={15} /></Link>
          <button type="button" className="profile-logout" onClick={() => signOut(auth)}><LogOut size={15} /> Cerrar sesión</button>
        </aside>

        <div className="profile-editor-column">
          {notice ? <div className="profile-notice"><Check size={17} /> {notice}</div> : null}
          {error ? <div className="form-error" role="alert">{error}</div> : null}

          <section id="informacion" className="profile-editor-card reveal-card">
            <div className="profile-card-heading">
              <div><span className="profile-section-number">01</span><div><h2>Información pública</h2><p>Tu presentación principal dentro de Germina.</p></div></div>
              <span className="profile-privacy-badge public">Público</span>
            </div>
            <div className="profile-editor-grid">
              <label><span>Tipo de perfil</span><select value={profile.kind} onChange={(event) => patchProfile("kind", event.target.value as "persona" | "negocio")}><option value="persona">Talento / profesional</option><option value="negocio">Negocio / emprendimiento</option></select></label>
              <label><span>Nombre</span><input value={profile.name} onChange={(event) => patchProfile("name", event.target.value)} placeholder="Tu nombre o marca" /></label>
              <label><span>Categoría</span><select value={profile.category} onChange={(event) => patchProfile("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Profesión / especialidad</span><input value={profile.profession} onChange={(event) => patchProfile("profession", event.target.value)} placeholder="Ej. Diseñadora de marca" /></label>
              <label className="profile-field-wide"><span>Titular corto</span><input value={profile.headline} onChange={(event) => patchProfile("headline", event.target.value)} placeholder="Contá en una línea qué hacés" /></label>
              <label className="profile-field-wide"><span>Descripción</span><textarea rows={6} value={profile.description} onChange={(event) => patchProfile("description", event.target.value)} placeholder="Experiencia, propuesta de valor, tipo de proyectos que buscás..." /></label>
              <label><span>Teléfono general</span><input value={profile.phone} onChange={(event) => patchProfile("phone", event.target.value)} placeholder="+505 8888 8888" /></label>
              <label className="profile-switch-field"><span>Disponibilidad</span><button type="button" className={profile.available ? "profile-switch active" : "profile-switch"} onClick={() => patchProfile("available", !profile.available)}><i /><strong>{profile.available ? "Disponible" : "Con agenda"}</strong></button></label>
            </div>
          </section>

          <section id="ubicacion" className="profile-editor-card reveal-card">
            <div className="profile-card-heading">
              <div><span className="profile-section-number">02</span><div><h2>Ubicación</h2><p>Seleccioná tu punto en el mapa. Vos decidís si esa ubicación exacta se hace pública.</p></div></div>
              <span className={`profile-privacy-badge ${profile.locationPublic ? "public" : "private"}`}>{profile.locationPublic ? "Ubicación pública" : "Ubicación privada"}</span>
            </div>
            <label className="profile-single-field"><span>Ciudad / departamento</span><input value={profile.location} onChange={(event) => patchProfile("location", event.target.value)} placeholder="Ej. Managua, Nicaragua" /></label>
            <div className="business-map-consent"><ShieldCheck size={17} /><span><strong>Ubicación controlada por vos</strong> Germina conserva el punto que selecciones manualmente. Nunca obtiene tu ubicación automática del dispositivo.</span></div>
            <ProfileLocationMap value={profile.coordinates} onChange={(coordinates) => patchProfile("coordinates", coordinates)} />
            <label className={`location-public-consent ${profile.locationPublic ? "active" : ""}`}>
              <input type="checkbox" checked={profile.locationPublic} onChange={(event) => patchProfile("locationPublic", event.target.checked)} />
              <span className="location-consent-box"><Check size={15} /></span>
              <span><strong>Permitir que esta ubicación sea pública</strong><small>Si la activás, tu pin aparecerá en el mapa público de Germina y Google Maps podrá mostrarse en tu perfil. Si la dejás apagada, el punto exacto queda privado.</small></span>
            </label>
          </section>

          <section id="servicios" className="profile-editor-card reveal-card">
            <div className="profile-card-heading">
              <div><span className="profile-section-number">03</span><div><h2>Servicios y contenido</h2><p>Mostrá visualmente lo que hacés o lo que ofrece tu emprendimiento.</p></div></div>
              <span className="profile-privacy-badge public">Público</span>
            </div>
            <label className="profile-single-field"><span>Servicios principales</span><input value={servicesText} onChange={(event) => setServicesText(event.target.value)} placeholder="Branding, fotografía, repostería, desarrollo web..." /><small>Separalos con comas.</small></label>
            <div className="portfolio-upload-panel">
              <div className="portfolio-upload-fields">
                <label><span>Título del contenido</span><input value={portfolioTitle} onChange={(event) => setPortfolioTitle(event.target.value)} placeholder="Ej. Identidad visual Café Norte" /></label>
                <label><span>Descripción breve</span><input value={portfolioDescription} onChange={(event) => setPortfolioDescription(event.target.value)} placeholder="Qué hiciste, producto o servicio mostrado" /></label>
              </div>
              <input ref={portfolioInputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadPortfolio(event.target.files)} />
              <button type="button" className="portfolio-drop-button" disabled={uploadingPortfolio} onClick={() => portfolioInputRef.current?.click()}>
                {uploadingPortfolio ? <LoaderCircle className="spin" size={25} /> : <ImagePlus size={25} />}
                <strong>{uploadingPortfolio ? "Subiendo contenido..." : "Agregar imágenes de tus servicios"}</strong>
                <span>JPG, PNG o WebP · hasta 10 MB por imagen</span>
              </button>
            </div>
            {profile.portfolio.length ? <div className="profile-portfolio-grid">{profile.portfolio.map((item) => <article key={item.id}><img src={item.url} alt={item.title} /><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div><button type="button" aria-label="Eliminar imagen" onClick={() => removePortfolioItem(item)}><Trash2 size={15} /></button></article>)}</div> : <div className="profile-empty-gallery"><ImagePlus size={22} /> Tu portafolio aparecerá aquí.</div>}
          </section>

          <section id="redes" className="profile-editor-card reveal-card">
            <div className="profile-card-heading">
              <div><span className="profile-section-number">04</span><div><h2>Redes y contacto</h2><p>Conectá tu presencia digital con tu perfil Germina.</p></div></div>
              <span className="profile-privacy-badge public">Público</span>
            </div>
            <div className="profile-editor-grid social-input-grid">
              <label><span><Globe2 size={14} /> Sitio web</span><input value={profile.socialLinks.website} onChange={(event) => patchSocial("website", event.target.value)} placeholder="https://tusitio.com" /></label>
              <label><span>WhatsApp</span><input value={profile.socialLinks.whatsapp} onChange={(event) => patchSocial("whatsapp", event.target.value)} placeholder="+505 8888 8888" /></label>
              <label><span>Facebook</span><input value={profile.socialLinks.facebook} onChange={(event) => patchSocial("facebook", event.target.value)} placeholder="https://facebook.com/usuario" /></label>
              <label><span><Instagram size={14} /> Instagram</span><input value={profile.socialLinks.instagram} onChange={(event) => patchSocial("instagram", event.target.value)} placeholder="https://instagram.com/usuario" /></label>
              <label className="profile-field-wide"><span>TikTok</span><input value={profile.socialLinks.tiktok} onChange={(event) => patchSocial("tiktok", event.target.value)} placeholder="https://tiktok.com/@usuario" /></label>
            </div>
          </section>

          <section id="legal" className="profile-editor-card legal-private-card reveal-card">
            <div className="legal-security-banner">
              <span><LockKeyhole size={20} /></span>
              <div><strong>Área privada y confidencial</strong><p>Estos documentos no forman parte de tu perfil público. Solo vos y, posteriormente, el equipo administrativo autorizado de Germina podrán acceder a ellos.</p></div>
            </div>
            <div className="profile-card-heading">
              <div><span className="profile-section-number">05</span><div><h2>Documentación legal</h2><p>Guardá documentación para procesos futuros de validación.</p></div></div>
              <span className="profile-privacy-badge private"><ShieldCheck size={13} /> Privado</span>
            </div>
            <div className="legal-upload-row">
              <label><span>Tipo de documento</span><select value={legalType} onChange={(event) => setLegalType(event.target.value)}><option>Identificación</option><option>RUC / Registro fiscal</option><option>Constancia de negocio</option><option>Licencia / permiso</option><option>Otro documento</option></select></label>
              <input ref={legalInputRef} hidden type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => event.target.files?.[0] && uploadLegal(event.target.files[0])} />
              <button type="button" className="legal-upload-button" disabled={uploadingLegal} onClick={() => legalInputRef.current?.click()}><UploadCloud size={18} /> {uploadingLegal ? "Subiendo..." : "Subir documento"}</button>
            </div>
            <p className="legal-helper">PDF, JPG o PNG · máximo 15 MB. Los archivos se guardan en una ruta privada de Firebase Storage.</p>
            <div className="legal-document-list">
              {legalDocuments.length ? legalDocuments.map((item) => <article key={item.id}><span className="legal-file-icon"><FileText size={19} /></span><div><strong>{item.documentType}</strong><p>{item.fileName} · {(item.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" onClick={() => openLegalDocument(item)}>Ver</button><button type="button" className="danger" onClick={() => removeLegalDocument(item)} aria-label="Eliminar documento"><Trash2 size={15} /></button></article>) : <div className="legal-empty"><FileCheck2 size={22} /><span>No has subido documentos legales.</span></div>}
            </div>
          </section>

          <div className="profile-save-bar">
            <div><strong>Guardá tus cambios</strong><span>La ubicación exacta solo será pública si activaste la casilla de consentimiento.</span></div>
            <button type="button" className="btn btn-primary btn-lg" disabled={saving} onClick={saveProfile}>{saving ? <><LoaderCircle className="spin" size={18} /> Guardando...</> : <><Save size={18} /> Guardar perfil</>}</button>
          </div>
        </div>
      </div>
    </main>
  );
}
