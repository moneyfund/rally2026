"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, LoaderCircle, Mail, MapPin, Send, UserRound } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import type { JobPost } from "@/lib/marketplace-types";

function jobFromData(id: string, data: Record<string, unknown>): JobPost {
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

export function JobDetail({ id }: { id: string }) {
  const [job, setJob] = useState<JobPost | null>(null);
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyVerified, setCompanyVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => onSnapshot(doc(db, "jobPosts", id), (snapshot) => {
    if (!snapshot.exists()) {
      setJob(null);
      setLoading(false);
      return;
    }
    const next = jobFromData(snapshot.id, snapshot.data());
    if (next.status !== "active") setJob(null);
    else setJob(next);
    setLoading(false);
  }, () => {
    setJob(null);
    setLoading(false);
  }), [id]);

  useEffect(() => {
    if (!job?.companyId) return;
    return onSnapshot(doc(db, "profiles", job.companyId), (snapshot) => {
      if (!snapshot.exists()) return;
      setCompanyDescription(String(snapshot.data().description ?? ""));
      setCompanyVerified(Boolean(snapshot.data().verified));
    }, () => undefined);
  }, [job?.companyId]);

  async function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !job) return;
    setSubmitting(true);
    setError("");
    try {
      const [profileSnapshot, accountSnapshot] = await Promise.all([
        getDoc(doc(db, "profiles", user.uid)),
        getDoc(doc(db, "users", user.uid)),
      ]);
      const profile = profileSnapshot.data() ?? {};
      if (profile.kind === "empresa") {
        setError("Las cuentas empresariales no pueden postularse a vacantes.");
        return;
      }
      const applicationRef = doc(db, "jobPosts", job.id, "applications", user.uid);
      await setDoc(applicationRef, {
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        applicantId: user.uid,
        applicantName: String(profile.name ?? accountSnapshot.data()?.displayName ?? user.displayName ?? "Postulante Germina"),
        applicantEmail: String(accountSnapshot.data()?.email ?? user.email ?? ""),
        applicantPhone: String(profile.phone ?? ""),
        applicantProfileId: user.uid,
        message: String(new FormData(event.currentTarget).get("message") ?? "").trim(),
        status: "sent",
        createdAt: serverTimestamp(),
      });
      setApplied(true);
    } catch (caught) {
      const message = firebaseMessage(caught);
      setError(message.includes("permission") ? "No pudimos registrar la postulación. Si ya aplicaste a esta vacante, tu solicitud ya está guardada." : message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="job-detail-page"><div className="job-detail-loading"><LoaderCircle className="spin" size={28} /> Cargando vacante...</div></main>;
  if (!job) return <main className="job-detail-page"><div className="job-detail-missing"><BriefcaseBusiness size={34} /><h1>Esta vacante ya no está disponible.</h1><p>Puede haber sido pausada, cerrada o eliminada por la empresa.</p><Link href="/descubrir" className="btn btn-primary">Volver a Descubrir</Link></div></main>;

  return (
    <main className="job-detail-page">
      <div className="shell job-detail-shell">
        <Link href="/descubrir" className="job-back"><ArrowLeft size={16} /> Volver a Descubrir</Link>
        <section className="job-detail-hero">
          <div className="job-company-mark">{job.companyLogo ? <img src={job.companyLogo} alt="" /> : <Building2 size={30} />}</div>
          <div className="job-detail-heading"><div className="job-detail-kicker"><span>{job.category}</span>{job.featured ? <strong>Destacada</strong> : null}</div><h1>{job.title}</h1><Link href={`/perfil/${job.companyId}`}>{job.companyName} {companyVerified ? <BadgeCheck size={16} /> : null}</Link><div className="job-detail-meta"><span><MapPin size={15} /> {job.location}</span><span><BriefcaseBusiness size={15} /> {job.modality}</span><span>{job.jobType}</span>{job.salary ? <span>{job.salary}</span> : null}</div></div>
        </section>

        <div className="job-detail-grid">
          <div className="job-detail-main">
            <section className="job-detail-card"><span className="eyebrow">SOBRE LA VACANTE</span><h2>Qué harás en este rol</h2><p>{job.description}</p></section>
            <section className="job-detail-card"><span className="eyebrow">REQUISITOS</span><h2>Lo que busca la empresa</h2><p className="job-preline">{job.requirements}</p></section>
            {job.benefits ? <section className="job-detail-card"><span className="eyebrow">BENEFICIOS</span><h2>Lo que ofrece la oportunidad</h2><p className="job-preline">{job.benefits}</p></section> : null}
            <section className="job-detail-card job-company-card"><div className="job-company-card-head"><span>{job.companyLogo ? <img src={job.companyLogo} alt="" /> : <Building2 size={22} />}</span><div><small>EMPRESA</small><h2>{job.companyName}</h2></div>{companyVerified ? <em><BadgeCheck size={15} /> Verificada</em> : null}</div><p>{companyDescription || "Conocé el perfil empresarial para ver más información sobre esta organización."}</p><Link href={`/perfil/${job.companyId}`}>Ver perfil empresarial</Link></section>
          </div>

          <aside className="job-apply-card">
            {applied ? <div className="job-applied"><CheckCircle2 size={34} /><h3>Postulación enviada</h3><p>La empresa ya recibió tu perfil y tus datos de contacto.</p><Link href="/descubrir">Seguir explorando</Link></div> : user ? <form onSubmit={apply}><span className="eyebrow">POSTULARME</span><h3>Enviá tu perfil a {job.companyName}</h3><p>Compartiremos tu perfil de Germina, correo y teléfono con esta empresa.</p><label><span>Mensaje opcional</span><textarea name="message" rows={5} placeholder="Contales brevemente por qué te interesa la oportunidad." /></label>{error ? <div className="form-error">{error}</div> : null}<button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} {submitting ? "Enviando..." : "Enviar postulación"}</button><small><UserRound size={14} /> Se adjunta tu perfil público automáticamente.</small></form> : <div className="job-login-cta"><Mail size={30} /><h3>Iniciá sesión para postularte</h3><p>Necesitamos una cuenta Germina para enviar tu perfil a la empresa.</p><Link href="/entrar" className="btn btn-primary btn-lg">Iniciar sesión</Link><Link href="/crear-perfil">Crear perfil gratis</Link></div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
