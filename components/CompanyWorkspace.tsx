"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  ImagePlus,
  LoaderCircle,
  LogOut,
  MapPin,
  PauseCircle,
  Plus,
  Save,
  Send,
  Trash2,
  UploadCloud,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getBlob, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import type { JobApplication, JobPost, VerificationStatus } from "@/lib/marketplace-types";
import type { LegalDocument } from "@/lib/profile-types";

type CompanyTab = "overview" | "profile" | "jobs" | "applications";

type CompanyProfile = {
  name: string;
  legalName: string;
  category: string;
  headline: string;
  description: string;
  location: string;
  phone: string;
  companyEmail: string;
  website: string;
  representativeName: string;
  representativeRole: string;
  avatarUrl: string;
  googlePhotoUrl: string;
  coverUrl: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  verificationNote: string;
  partner: boolean;
};

const emptyCompany: CompanyProfile = {
  name: "",
  legalName: "",
  category: "Servicios profesionales",
  headline: "",
  description: "",
  location: "",
  phone: "",
  companyEmail: "",
  website: "",
  representativeName: "",
  representativeRole: "",
  avatarUrl: "",
  googlePhotoUrl: "",
  coverUrl: "",
  verified: false,
  verificationStatus: "pending",
  verificationNote: "",
  partner: false,
};

const companyCategories = ["Tecnología", "Construcción", "Finanzas", "Comercio", "Servicios profesionales", "Industria", "Turismo", "Educación", "Salud", "Logística", "Otros"];
const jobCategories = ["Administración", "Atención al cliente", "Diseño", "Finanzas", "Ingeniería", "Marketing", "Operaciones", "Recursos Humanos", "Tecnología", "Ventas", "Otros"];

function normalizeVerification(data: Record<string, unknown>): VerificationStatus {
  if (data.verificationStatus === "approved" || data.verificationStatus === "rejected" || data.verificationStatus === "pending") return data.verificationStatus;
  return data.verified === true ? "approved" : "pending";
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function dateLabel(value: unknown) {
  if (!value || typeof value !== "object") return "Reciente";
  const candidate = value as { toDate?: () => Date };
  if (typeof candidate.toDate !== "function") return "Reciente";
  return new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric" }).format(candidate.toDate());
}

function profileFromData(data: Record<string, unknown>, user: User): CompanyProfile {
  const social = data.socialLinks && typeof data.socialLinks === "object" ? data.socialLinks as Record<string, unknown> : {};
  return {
    name: String(data.name ?? user.displayName ?? ""),
    legalName: String(data.legalName ?? ""),
    category: String(data.category ?? "Servicios profesionales"),
    headline: String(data.headline ?? data.profession ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    phone: String(data.phone ?? ""),
    companyEmail: String(data.companyEmail ?? user.email ?? ""),
    website: String(data.website ?? social.website ?? ""),
    representativeName: String(data.representativeName ?? ""),
    representativeRole: String(data.representativeRole ?? ""),
    avatarUrl: String(data.avatarUrl ?? ""),
    googlePhotoUrl: String(data.googlePhotoUrl ?? user.photoURL ?? ""),
    coverUrl: String(data.coverUrl ?? ""),
    verified: Boolean(data.verified),
    verificationStatus: normalizeVerification(data),
    verificationNote: String(data.verificationNote ?? ""),
    partner: Boolean(data.partner),
  };
}

function jobFromDoc(id: string, data: Record<string, unknown>): JobPost {
  return {
    id,
    companyId: String(data.companyId ?? ""),
    companyName: String(data.companyName ?? "Empresa Germina"),
    companyLogo: String(data.companyLogo ?? ""),
    title: String(data.title ?? "Vacante"),
    category: String(data.category ?? "Otros"),
    modality: String(data.modality ?? "Presencial"),
    location: String(data.location ?? "Nicaragua"),
    jobType: String(data.jobType ?? "Tiempo completo"),
    salary: String(data.salary ?? ""),
    description: String(data.description ?? ""),
    requirements: String(data.requirements ?? ""),
    benefits: String(data.benefits ?? ""),
    status: data.status === "paused" || data.status === "closed" ? data.status : "active",
    featured: Boolean(data.featured),
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function applicationFromDoc(id: string, data: Record<string, unknown>): JobApplication {
  return {
    id,
    jobId: String(data.jobId ?? ""),
    jobTitle: String(data.jobTitle ?? "Vacante"),
    companyId: String(data.companyId ?? ""),
    applicantId: String(data.applicantId ?? ""),
    applicantName: String(data.applicantName ?? "Postulante"),
    applicantEmail: String(data.applicantEmail ?? ""),
    applicantPhone: String(data.applicantPhone ?? ""),
    applicantProfileId: String(data.applicantProfileId ?? data.applicantId ?? ""),
    message: String(data.message ?? ""),
    status: data.status === "viewed" || data.status === "shortlisted" || data.status === "rejected" ? data.status : "sent",
    createdAt: data.createdAt,
  };
}

export function CompanyWorkspace() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CompanyProfile>(emptyCompany);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [tab, setTab] = useState<CompanyTab>("overview");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const logoInput = useRef<HTMLInputElement | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);
  const legalInput = useRef<HTMLInputElement | null>(null);

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
    let cleanups: Array<() => void> = [];

    async function connect() {
      setLoading(true);
      try {
        const [account, companyProfile] = await Promise.all([
          getDoc(doc(db, "users", user!.uid)),
          getDoc(doc(db, "profiles", user!.uid)),
        ]);
        const accountType = String(account.data()?.accountType ?? companyProfile.data()?.kind ?? "");
        if (accountType !== "empresa" && companyProfile.data()?.kind !== "empresa") {
          router.replace("/mi-perfil");
          return;
        }

        if (companyProfile.exists() && active) setProfile(profileFromData(companyProfile.data(), user!));

        cleanups.push(onSnapshot(doc(db, "profiles", user!.uid), (snapshot) => {
          if (snapshot.exists() && active) setProfile(profileFromData(snapshot.data(), user!));
        }, (caught) => active && setError(firebaseMessage(caught))));

        const jobsQuery = query(collection(db, "jobPosts"), where("companyId", "==", user!.uid));
        cleanups.push(onSnapshot(jobsQuery, (snapshot) => {
          if (!active) return;
          const next = snapshot.docs.map((item) => jobFromDoc(item.id, item.data()));
          next.sort((a, b) => Number(b.featured) - Number(a.featured));
          setJobs(next);
        }, (caught) => active && setError(firebaseMessage(caught))));

        const applicationsQuery = query(collectionGroup(db, "applications"), where("companyId", "==", user!.uid));
        cleanups.push(onSnapshot(applicationsQuery, (snapshot) => {
          if (!active) return;
          setApplications(snapshot.docs.map((item) => applicationFromDoc(item.id, item.data())));
        }, (caught) => active && setError(firebaseMessage(caught))));

        cleanups.push(onSnapshot(collection(db, "users", user!.uid, "legalDocuments"), (snapshot) => {
          if (!active) return;
          setLegalDocuments(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<LegalDocument, "id">) })));
        }, (caught) => active && setError(firebaseMessage(caught))));
      } catch (caught) {
        if (active) setError(firebaseMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    connect();
    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [user, authReady, router]);

  const approved = profile.verified && profile.verificationStatus === "approved";
  const activeJobs = jobs.filter((job) => job.status === "active");
  const newApplications = applications.filter((application) => application.status === "sent");
  const applicationsByJob = useMemo(() => {
    const counts = new Map<string, number>();
    applications.forEach((application) => counts.set(application.jobId, (counts.get(application.jobId) ?? 0) + 1));
    return counts;
  }, [applications]);

  function patch<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveCompanyProfile() {
    if (!user) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await setDoc(doc(db, "profiles", user.uid), {
        ownerId: user.uid,
        kind: "empresa",
        name: profile.name.trim(),
        legalName: profile.legalName.trim(),
        category: profile.category,
        profession: profile.headline.trim(),
        headline: profile.headline.trim(),
        description: profile.description.trim(),
        location: profile.location.trim(),
        phone: profile.phone.trim(),
        companyEmail: profile.companyEmail.trim().toLowerCase(),
        website: profile.website.trim(),
        representativeName: profile.representativeName.trim(),
        representativeRole: profile.representativeRole.trim(),
        socialLinks: {
          website: profile.website.trim(),
          whatsapp: profile.phone.trim(),
          facebook: "",
          instagram: "",
          tiktok: "",
        },
        avatarUrl: profile.avatarUrl,
        googlePhotoUrl: profile.googlePhotoUrl,
        coverUrl: profile.coverUrl,
        services: [],
        skills: [],
        portfolio: [],
        available: false,
        status: "active",
        coordinates: null,
        locationPublic: false,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email ?? profile.companyEmail,
        displayName: profile.name.trim(),
        accountType: "empresa",
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setNotice("Información empresarial actualizada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, kind: "avatar" | "cover") {
    if (!user) return;
    const max = kind === "avatar" ? 5 : 10;
    if (!file.type.startsWith("image/") || file.size > max * 1024 * 1024) {
      setError(`La imagen debe pesar menos de ${max} MB.`);
      return;
    }
    setBusy(kind);
    setError("");
    try {
      const fileRef = ref(storage, `profiles/${user.uid}/${kind}/${crypto.randomUUID()}-${safeFileName(file.name)}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      const field = kind === "avatar" ? "avatarUrl" : "coverUrl";
      patch(field, url);
      await setDoc(doc(db, "profiles", user.uid), { [field]: url, updatedAt: serverTimestamp() }, { merge: true });
      setNotice(kind === "avatar" ? "Logo actualizado." : "Portada actualizada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function uploadLegal(file: File) {
    if (!user) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > 15 * 1024 * 1024) {
      setError("El documento debe ser PDF, JPG o PNG y pesar menos de 15 MB.");
      return;
    }
    setBusy("legal");
    setError("");
    try {
      const storagePath = `legal/${user.uid}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      await uploadBytes(ref(storage, storagePath), file, { contentType: file.type });
      await addDoc(collection(db, "users", user.uid, "legalDocuments"), {
        fileName: file.name,
        storagePath,
        contentType: file.type,
        size: file.size,
        documentType: "Documento empresarial",
        createdAt: serverTimestamp(),
      });
      setNotice("Documento enviado para revisión administrativa.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function openLegal(item: LegalDocument) {
    try {
      const blob = await getBlob(ref(storage, item.storagePath));
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      setError(firebaseMessage(caught));
    }
  }

  async function deleteLegal(item: LegalDocument) {
    if (!user) return;
    setBusy(item.id);
    try {
      await deleteObject(ref(storage, item.storagePath));
      await deleteDoc(doc(db, "users", user.uid, "legalDocuments", item.id));
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function createJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !approved) return;
    setBusy("new-job");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await addDoc(collection(db, "jobPosts"), {
        companyId: user.uid,
        companyName: profile.name,
        companyLogo: profile.avatarUrl || profile.googlePhotoUrl,
        title: String(form.get("title") ?? "").trim(),
        category: String(form.get("category") ?? "Otros"),
        modality: String(form.get("modality") ?? "Presencial"),
        location: String(form.get("location") ?? profile.location).trim(),
        jobType: String(form.get("jobType") ?? "Tiempo completo"),
        salary: String(form.get("salary") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        requirements: String(form.get("requirements") ?? "").trim(),
        benefits: String(form.get("benefits") ?? "").trim(),
        status: "active",
        featured: false,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      event.currentTarget.reset();
      setNotice("Vacante publicada. Ya puede aparecer en Descubrir.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function setJobStatus(job: JobPost, status: "active" | "paused" | "closed") {
    setBusy(job.id);
    try {
      await updateDoc(doc(db, "jobPosts", job.id), { status, updatedAt: serverTimestamp() });
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function removeJob(job: JobPost) {
    setBusy(job.id);
    try {
      await deleteDoc(doc(db, "jobPosts", job.id));
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  async function setApplicationStatus(application: JobApplication, status: "viewed" | "shortlisted" | "rejected") {
    setBusy(application.id);
    try {
      await updateDoc(doc(db, "jobPosts", application.jobId, "applications", application.id), { status });
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusy("");
    }
  }

  if (!authReady || loading) return <main className="company-page"><div className="company-access-card"><LoaderCircle className="spin" size={30} /><strong>Preparando Mi empresa</strong><span>Conectando datos y permisos...</span></div></main>;
  if (!user) return <main className="company-page"><div className="company-access-card"><Building2 size={34} /><strong>Mi empresa</strong><span>Iniciá sesión con la cuenta empresarial.</span><Link className="btn btn-primary" href="/entrar">Iniciar sesión</Link></div></main>;

  const avatar = profile.avatarUrl || profile.googlePhotoUrl;
  const statusLabel = profile.verificationStatus === "approved" ? "Empresa aprobada" : profile.verificationStatus === "rejected" ? "Solicitud rechazada" : "Revisión pendiente";

  return (
    <main className="company-page">
      <div className="company-shell">
        <aside className="company-sidebar">
          <div className="company-brand"><span>{avatar ? <img src={avatar} alt="" /> : <Building2 size={24} />}</span><div><strong>{profile.name || "Mi empresa"}</strong><small>GERMINA EMPRESAS</small></div></div>
          <nav>
            <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><BriefcaseBusiness size={18} /> Resumen</button>
            <button type="button" className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><Building2 size={18} /> Perfil empresarial</button>
            <button type="button" className={tab === "jobs" ? "active" : ""} onClick={() => approved && setTab("jobs")} disabled={!approved}><Plus size={18} /> Vacantes <em>{activeJobs.length}</em></button>
            <button type="button" className={tab === "applications" ? "active" : ""} onClick={() => approved && setTab("applications")} disabled={!approved}><UsersRound size={18} /> Postulaciones <em>{newApplications.length}</em></button>
          </nav>
          <div className={`company-verification ${profile.verificationStatus}`}><BadgeCheck size={17} /><div><strong>{statusLabel}</strong><small>{approved ? "Cuenta habilitada para contratar." : "Las vacantes se habilitan después de la revisión."}</small></div></div>
          <div className="company-sidebar-links">{approved ? <Link href={`/perfil/${user.uid}`}><ExternalLink size={16} /> Ver perfil público</Link> : null}<Link href="/"><ChevronRight size={16} /> Ir a la web pública</Link><button type="button" onClick={() => signOut(auth)}><LogOut size={16} /> Cerrar sesión</button></div>
        </aside>

        <section className="company-content">
          <header className="company-topbar"><div><span>GERMINA · EMPRESAS</span><h1>{tab === "overview" ? "Panel empresarial" : tab === "profile" ? "Perfil empresarial" : tab === "jobs" ? "Vacantes" : "Postulaciones"}</h1></div><div className="company-user"><span>{user.photoURL ? <img src={user.photoURL} alt="" /> : <UserRound size={17} />}</span><div><strong>{user.displayName || profile.representativeName || "Representante"}</strong><small>{user.email}</small></div></div></header>

          {error ? <div className="company-message error"><XCircle size={17} /> {error}<button type="button" onClick={() => setError("")}>Cerrar</button></div> : null}
          {notice ? <div className="company-message success"><CheckCircle2 size={17} /> {notice}<button type="button" onClick={() => setNotice("")}>Cerrar</button></div> : null}

          {!approved ? <section className={`company-review-banner ${profile.verificationStatus}`}><div><span><BadgeCheck size={16} /> VERIFICACIÓN EMPRESARIAL</span><h2>{profile.verificationStatus === "rejected" ? "Necesitamos una corrección antes de habilitar la empresa." : "Tu empresa está siendo revisada por Germina."}</h2><p>{profile.verificationStatus === "rejected" ? profile.verificationNote || "Revisá tus datos y documentación y volvé a guardar la información." : "Podés completar el perfil y subir documentación mientras administración valida la empresa. Las vacantes permanecen bloqueadas hasta la aprobación."}</p></div><button type="button" onClick={() => setTab("profile")}>Completar expediente <ChevronRight size={17} /></button></section> : null}

          {tab === "overview" ? (
            <>
              <section className="company-kpis">
                <article><span><BriefcaseBusiness size={20} /></span><div><small>Vacantes activas</small><strong>{activeJobs.length}</strong><em>{approved ? "publicadas" : "bloqueadas"}</em></div></article>
                <article><span><UsersRound size={20} /></span><div><small>Postulaciones</small><strong>{applications.length}</strong><em>{newApplications.length} nuevas</em></div></article>
                <article><span><BadgeCheck size={20} /></span><div><small>Verificación</small><strong>{approved ? "Activa" : "Pendiente"}</strong><em>{profile.partner ? "Empresa aliada" : "Cuenta empresarial"}</em></div></article>
                <article><span><FileText size={20} /></span><div><small>Documentos</small><strong>{legalDocuments.length}</strong><em>en expediente</em></div></article>
              </section>
              <section className="company-grid-two">
                <article className="company-panel"><div className="company-panel-head"><div><span>VACANTES</span><h2>Actividad de contratación</h2></div>{approved ? <button type="button" onClick={() => setTab("jobs")}><Plus size={16} /> Nueva vacante</button> : null}</div><div className="company-job-mini-list">{jobs.slice(0, 5).map((job) => <button type="button" key={job.id} onClick={() => setTab("jobs")}><span className={`job-status-dot ${job.status}`} /><div><strong>{job.title}</strong><small>{job.location} · {applicationsByJob.get(job.id) ?? 0} postulaciones</small></div><ChevronRight size={16} /></button>)}{!jobs.length ? <div className="company-empty"><BriefcaseBusiness size={24} /><strong>Aún no hay vacantes</strong><span>{approved ? "Publicá la primera oportunidad para empezar a recibir postulaciones." : "Se habilitarán cuando la empresa sea aprobada."}</span></div> : null}</div></article>
                <article className="company-panel"><div className="company-panel-head"><div><span>POSTULACIONES</span><h2>Talento reciente</h2></div>{approved ? <button type="button" onClick={() => setTab("applications")}>Ver todas</button> : null}</div><div className="company-app-mini-list">{applications.slice(0, 5).map((application) => <div key={`${application.jobId}-${application.id}`}><span>{application.applicantName.split(/\s+/).slice(0,2).map((part) => part[0]).join("")}</span><div><strong>{application.applicantName}</strong><small>{application.jobTitle} · {dateLabel(application.createdAt)}</small></div><em className={application.status}>{application.status === "sent" ? "Nueva" : application.status === "shortlisted" ? "Preselección" : application.status === "rejected" ? "Descartada" : "Vista"}</em></div>)}{!applications.length ? <div className="company-empty"><UsersRound size={24} /><strong>Sin postulaciones todavía</strong><span>Cuando alguien aplique a una vacante aparecerá aquí.</span></div> : null}</div></article>
              </section>
            </>
          ) : tab === "profile" ? (
            <section className="company-profile-layout">
              <article className="company-panel">
                <div className="company-panel-head"><div><span>IDENTIDAD</span><h2>Perfil empresarial</h2><p>La información pública que verán candidatos y visitantes.</p></div><button type="button" className="primary" onClick={saveCompanyProfile} disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />} Guardar</button></div>
                <div className="company-media-row"><div className="company-logo-editor"><span>{avatar ? <img src={avatar} alt="" /> : <Building2 size={30} />}</span><input ref={logoInput} hidden type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], "avatar")} /><button type="button" onClick={() => logoInput.current?.click()}><Camera size={15} /> {busy === "avatar" ? "Subiendo..." : "Cambiar logo"}</button></div><div className="company-cover-editor" style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined}><input ref={coverInput} hidden type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], "cover")} /><button type="button" onClick={() => coverInput.current?.click()}><ImagePlus size={15} /> {busy === "cover" ? "Subiendo..." : "Cambiar portada"}</button></div></div>
                <div className="company-form-grid">
                  <label><span>Nombre comercial</span><input value={profile.name} onChange={(event) => patch("name", event.target.value)} /></label>
                  <label><span>Razón social</span><input value={profile.legalName} onChange={(event) => patch("legalName", event.target.value)} /></label>
                  <label><span>Sector</span><select value={profile.category} onChange={(event) => patch("category", event.target.value)}>{companyCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label><span>Ubicación</span><div className="input-icon"><MapPin size={15} /><input value={profile.location} onChange={(event) => patch("location", event.target.value)} /></div></label>
                  <label><span>Correo corporativo</span><input type="email" value={profile.companyEmail} onChange={(event) => patch("companyEmail", event.target.value)} /></label>
                  <label><span>Teléfono</span><input value={profile.phone} onChange={(event) => patch("phone", event.target.value)} /></label>
                  <label className="span-two"><span>Sitio web</span><input value={profile.website} onChange={(event) => patch("website", event.target.value)} /></label>
                  <label><span>Representante</span><input value={profile.representativeName} onChange={(event) => patch("representativeName", event.target.value)} /></label>
                  <label><span>Cargo</span><input value={profile.representativeRole} onChange={(event) => patch("representativeRole", event.target.value)} /></label>
                  <label className="span-two"><span>Descripción corta</span><input value={profile.headline} onChange={(event) => patch("headline", event.target.value)} /></label>
                  <label className="span-two"><span>Descripción de la empresa</span><textarea rows={6} value={profile.description} onChange={(event) => patch("description", event.target.value)} /></label>
                </div>
              </article>

              <aside className="company-panel company-doc-panel"><div className="company-panel-head"><div><span>EXPEDIENTE</span><h2>Documentación</h2><p>Archivos privados para validación administrativa.</p></div></div><input ref={legalInput} hidden type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => event.target.files?.[0] && uploadLegal(event.target.files[0])} /><button type="button" className="company-upload-document" onClick={() => legalInput.current?.click()}><UploadCloud size={20} /><span><strong>{busy === "legal" ? "Subiendo documento..." : "Subir documento empresarial"}</strong><small>PDF, JPG o PNG · máximo 15 MB</small></span></button><div className="company-doc-list">{legalDocuments.map((item) => <div key={item.id}><button type="button" onClick={() => openLegal(item)}><FileText size={16} /><span><strong>{item.documentType}</strong><small>{item.fileName}</small></span></button><button type="button" className="delete" disabled={busy === item.id} onClick={() => deleteLegal(item)}><Trash2 size={15} /></button></div>)}{!legalDocuments.length ? <p>No hay documentos cargados todavía.</p> : null}</div></aside>
            </section>
          ) : tab === "jobs" ? (
            <section className="company-jobs-layout">
              <article className="company-panel">
                <div className="company-panel-head"><div><span>PUBLICAR</span><h2>Nueva vacante</h2><p>Creá una oportunidad clara y profesional para el talento de Germina.</p></div></div>
                <form className="company-job-form" onSubmit={createJob}>
                  <label className="span-two"><span>Título del puesto</span><input name="title" required placeholder="Ej. Desarrollador Frontend" /></label>
                  <label><span>Área</span><select name="category" defaultValue="Tecnología">{jobCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label><span>Modalidad</span><select name="modality"><option>Presencial</option><option>Remoto</option><option>Híbrido</option></select></label>
                  <label><span>Ubicación</span><input name="location" defaultValue={profile.location} required /></label>
                  <label><span>Tipo de jornada</span><select name="jobType"><option>Tiempo completo</option><option>Medio tiempo</option><option>Temporal</option><option>Práctica</option><option>Freelance</option></select></label>
                  <label className="span-two"><span>Salario / rango opcional</span><input name="salary" placeholder="Ej. C$25,000 – C$35,000" /></label>
                  <label className="span-two"><span>Descripción</span><textarea name="description" rows={5} required placeholder="Responsabilidades, contexto del rol y objetivos." /></label>
                  <label className="span-two"><span>Requisitos</span><textarea name="requirements" rows={4} required placeholder="Experiencia, conocimientos y requisitos indispensables." /></label>
                  <label className="span-two"><span>Beneficios</span><textarea name="benefits" rows={3} placeholder="Beneficios, flexibilidad, bonos, formación..." /></label>
                  <button className="btn btn-primary" type="submit" disabled={busy === "new-job"}>{busy === "new-job" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />} Publicar vacante</button>
                </form>
              </article>

              <article className="company-panel"><div className="company-panel-head"><div><span>GESTIÓN</span><h2>Vacantes publicadas</h2><p>{jobs.length} oportunidades creadas</p></div></div><div className="company-job-list">{jobs.map((job) => <div key={job.id} className="company-job-row"><div className="company-job-row-main"><span className={`job-status-dot ${job.status}`} /><div><strong>{job.title}</strong><small>{job.category} · {job.modality} · {job.location}</small><em>{applicationsByJob.get(job.id) ?? 0} postulaciones {job.featured ? "· Destacada por Germina" : ""}</em></div></div><span className={`company-job-state ${job.status}`}>{job.status === "active" ? "Activa" : job.status === "paused" ? "Pausada" : "Cerrada"}</span><div className="company-job-actions"><Link href={`/vacante/${job.id}`}><ExternalLink size={15} /></Link>{job.status === "active" ? <button type="button" onClick={() => setJobStatus(job, "paused")}><PauseCircle size={15} /> Pausar</button> : <button type="button" onClick={() => setJobStatus(job, "active")}><CheckCircle2 size={15} /> Activar</button>}<button type="button" onClick={() => setJobStatus(job, "closed")}><XCircle size={15} /> Cerrar</button><button type="button" className="danger" onClick={() => removeJob(job)}><Trash2 size={15} /></button></div></div>)}{!jobs.length ? <div className="company-empty"><BriefcaseBusiness size={28} /><strong>Publicá tu primera vacante</strong><span>Las oportunidades activas aparecerán en Descubrir y podrán destacarse en Inicio.</span></div> : null}</div></article>
            </section>
          ) : (
            <section className="company-panel"><div className="company-panel-head"><div><span>CANDIDATOS</span><h2>Postulaciones recibidas</h2><p>Revisá perfiles, datos de contacto y el mensaje de cada postulante.</p></div></div><div className="company-applications-table"><div className="company-app-head"><span>Postulante</span><span>Vacante</span><span>Contacto</span><span>Estado</span><span>Acciones</span></div>{applications.map((application) => <div className="company-app-row" key={`${application.jobId}-${application.id}`}><span><strong>{application.applicantName}</strong><small>{dateLabel(application.createdAt)}</small></span><span><strong>{application.jobTitle}</strong><small>{application.message || "Sin mensaje adicional"}</small></span><span><a href={`mailto:${application.applicantEmail}`}>{application.applicantEmail || "Sin correo"}</a><small>{application.applicantPhone}</small></span><span><em className={application.status}>{application.status === "sent" ? "Nueva" : application.status === "viewed" ? "Vista" : application.status === "shortlisted" ? "Preselección" : "Descartada"}</em></span><span className="company-app-actions"><Link href={`/perfil/${application.applicantProfileId}`} target="_blank">Perfil</Link><button type="button" onClick={() => setApplicationStatus(application, "viewed")}>Vista</button><button type="button" onClick={() => setApplicationStatus(application, "shortlisted")}>Preseleccionar</button><button type="button" onClick={() => setApplicationStatus(application, "rejected")}>Rechazar</button></span></div>)}{!applications.length ? <div className="company-empty"><UsersRound size={28} /><strong>Todavía no hay postulaciones</strong><span>Cuando un usuario se postule a una vacante aparecerá aquí con sus datos de contacto.</span></div> : null}</div></section>
          )}
        </section>
      </div>
    </main>
  );
}
