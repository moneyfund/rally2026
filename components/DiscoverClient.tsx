"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, MapPin, Search, SlidersHorizontal, Store, UserRound } from "lucide-react";
import { collection, onSnapshot, query as firestoreQuery, where, type DocumentData, type QuerySnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { profiles as demoProfiles } from "@/lib/demo-data";
import { db } from "@/lib/firebase";
import type { JobPost } from "@/lib/marketplace-types";

type MainDirectory = "talentos" | "emprendimientos" | "empresas";

type DirectoryProfile = {
  id: string;
  uid?: string;
  kind: "persona" | "negocio" | "empresa";
  name: string;
  role: string;
  category: string;
  location: string;
  description: string;
  skills: string[];
  avatarUrl: string;
  verified: boolean;
  available: boolean;
  demo?: boolean;
};

const VERIFICATION_ROLLOUT_AT = new Date("2026-08-28T22:51:00.000Z");

function snapshotToProfiles(snapshot: QuerySnapshot<DocumentData>): DirectoryProfile[] {
  return snapshot.docs.map((item) => {
    const data = item.data();
    const kind: DirectoryProfile["kind"] = data.kind === "empresa" ? "empresa" : data.kind === "negocio" ? "negocio" : "persona";
    const skills = Array.isArray(data.services) ? data.services.map(String) : Array.isArray(data.skills) ? data.skills.map(String) : [];
    return {
      id: item.id,
      uid: item.id,
      kind,
      name: String(data.name ?? "Perfil Germina"),
      role: String(data.profession ?? data.headline ?? data.category ?? "Perfil Germina"),
      category: String(data.category ?? "Servicios"),
      location: String(data.location ?? "Nicaragua"),
      description: String(data.description ?? "Perfil creado en Germina."),
      skills,
      avatarUrl: String(data.avatarUrl ?? data.googlePhotoUrl ?? ""),
      verified: data.verified === true || data.verificationStatus == null,
      available: data.available !== false,
    };
  }).filter((profile) => profile.kind === "empresa" || profile.kind === "persona" || profile.kind === "negocio");
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
    status: "active",
    featured: Boolean(data.featured),
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
}

const demoDirectory: DirectoryProfile[] = demoProfiles.map((profile) => ({
  id: `demo-${profile.id}`,
  kind: profile.kind,
  name: profile.name,
  role: profile.role,
  category: profile.category,
  location: profile.location,
  description: profile.description,
  skills: profile.skills,
  avatarUrl: "",
  verified: Boolean(profile.verified),
  available: profile.available !== false,
  demo: true,
}));

export function DiscoverClient() {
  const [directory, setDirectory] = useState<MainDirectory>("talentos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [approvedProfiles, setApprovedProfiles] = useState<DirectoryProfile[]>([]);
  const [legacyProfiles, setLegacyProfiles] = useState<DirectoryProfile[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    const approvedQuery = firestoreQuery(collection(db, "profiles"), where("verified", "==", true));
    const legacyQuery = firestoreQuery(collection(db, "profiles"), where("createdAt", "<", VERIFICATION_ROLLOUT_AT));
    const jobsQuery = firestoreQuery(collection(db, "jobPosts"), where("status", "==", "active"));

    const unsubApproved = onSnapshot(approvedQuery, (snapshot) => setApprovedProfiles(snapshotToProfiles(snapshot)), () => setApprovedProfiles([]));
    const unsubLegacy = onSnapshot(legacyQuery, (snapshot) => setLegacyProfiles(snapshotToProfiles(snapshot)), () => setLegacyProfiles([]));
    const unsubJobs = onSnapshot(jobsQuery, (snapshot) => setJobs(snapshot.docs.map((item) => jobFromDoc(item.id, item.data()))), () => setJobs([]));

    return () => {
      unsubApproved();
      unsubLegacy();
      unsubJobs();
    };
  }, []);

  const realProfiles = useMemo(() => {
    const map = new Map<string, DirectoryProfile>();
    [...legacyProfiles, ...approvedProfiles].forEach((profile) => map.set(profile.id, profile));
    return Array.from(map.values());
  }, [legacyProfiles, approvedProfiles]);

  const allProfiles = useMemo(() => [...realProfiles, ...demoDirectory], [realProfiles]);
  const normalized = query.trim().toLowerCase();

  const currentProfiles = useMemo(() => {
    const kind = directory === "talentos" ? "persona" : directory === "emprendimientos" ? "negocio" : "empresa";
    return allProfiles.filter((profile) => {
      if (profile.kind !== kind) return false;
      if (category !== "Todos" && profile.category !== category) return false;
      const haystack = `${profile.name} ${profile.role} ${profile.location} ${profile.category} ${profile.skills.join(" ")} ${profile.description}`.toLowerCase();
      return !normalized || haystack.includes(normalized);
    });
  }, [allProfiles, directory, category, normalized]);

  const visibleJobs = useMemo(() => jobs.filter((job) => {
    if (directory !== "empresas") return false;
    if (category !== "Todos" && job.category !== category) return false;
    const haystack = `${job.title} ${job.companyName} ${job.category} ${job.location} ${job.modality} ${job.description}`.toLowerCase();
    return !normalized || haystack.includes(normalized);
  }).sort((a, b) => Number(b.featured) - Number(a.featured)), [jobs, directory, category, normalized]);

  const availableCategories = useMemo(() => {
    const values = new Set<string>();
    if (directory === "empresas") {
      allProfiles.filter((profile) => profile.kind === "empresa").forEach((profile) => values.add(profile.category));
      jobs.forEach((job) => values.add(job.category));
    } else {
      const kind = directory === "talentos" ? "persona" : "negocio";
      allProfiles.filter((profile) => profile.kind === kind).forEach((profile) => values.add(profile.category));
    }
    return ["Todos", ...Array.from(values).sort()];
  }, [allProfiles, jobs, directory]);

  function switchDirectory(next: MainDirectory) {
    setDirectory(next);
    setCategory("Todos");
  }

  return (
    <div className="discover-v2">
      <section className="discover-search-surface">
        <div className="discover-search-copy"><span>DESCUBRIR GERMINA</span><h1>Encontrá talento, emprendimientos, empresas y oportunidades.</h1></div>
        <div className="discover-toolbar discover-toolbar-premium">
          <label className="search-box discover-main-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={directory === "empresas" ? "Buscá empresas, vacantes, áreas o ciudades" : "Buscá por habilidad, nombre, servicio o ciudad"} /></label>
          <button type="button" className="filter-button"><SlidersHorizontal size={17} /> Filtros</button>
        </div>
      </section>

      <section className="discover-main-tabs" aria-label="Categorías principales">
        <button type="button" className={directory === "talentos" ? "active" : ""} onClick={() => switchDirectory("talentos")}><span><UserRound size={22} /></span><div><strong>Talentos</strong><small>Personas, habilidades y profesionales</small></div><ArrowRight size={17} /></button>
        <button type="button" className={directory === "emprendimientos" ? "active" : ""} onClick={() => switchDirectory("emprendimientos")}><span><Store size={22} /></span><div><strong>Emprendimientos</strong><small>Negocios locales, servicios y marcas</small></div><ArrowRight size={17} /></button>
        <button type="button" className={directory === "empresas" ? "active" : ""} onClick={() => switchDirectory("empresas")}><span><Building2 size={22} /></span><div><strong>Empresas</strong><small>Organizaciones verificadas y vacantes</small></div><ArrowRight size={17} /></button>
      </section>

      <div className="discover-category-strip">{availableCategories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>

      {directory === "empresas" ? (
        <>
          <section className="discover-section-block">
            <div className="discover-section-head"><div><span>VACANTES ABIERTAS</span><h2>Oportunidades publicadas por empresas</h2></div><strong>{visibleJobs.length} vacantes</strong></div>
            {visibleJobs.length ? <div className="discover-jobs-grid">{visibleJobs.map((job) => <Link href={`/vacante/${job.id}`} className="discover-job-card" key={job.id}><div className="discover-job-top"><span className="discover-company-logo">{job.companyLogo ? <img src={job.companyLogo} alt="" /> : <Building2 size={20} />}</span><div><strong>{job.companyName}</strong><small>{job.category}</small></div>{job.featured ? <em>Destacada</em> : null}</div><h3>{job.title}</h3><p>{job.description}</p><div className="discover-job-meta"><span><MapPin size={14} /> {job.location}</span><span><BriefcaseBusiness size={14} /> {job.modality}</span><span>{job.jobType}</span></div><div className="discover-job-footer">{job.salary ? <span>{job.salary}</span> : <span>Ver condiciones</span>}<strong>Ver vacante <ArrowRight size={15} /></strong></div></Link>)}</div> : <div className="discover-empty-premium"><BriefcaseBusiness size={28} /><h3>No hay vacantes con estos filtros</h3><p>Probá otra búsqueda o volvé a “Todos”.</p></div>}
          </section>

          <section className="discover-section-block">
            <div className="discover-section-head"><div><span>DIRECTORIO EMPRESARIAL</span><h2>Empresas verificadas en Germina</h2></div><strong>{currentProfiles.length} empresas</strong></div>
            {currentProfiles.length ? <div className="discover-profile-grid">{currentProfiles.map((profile) => <DirectoryCard key={profile.id} profile={profile} />)}</div> : <div className="discover-empty-premium"><Building2 size={28} /><h3>No encontramos empresas</h3><p>Ajustá la búsqueda o la categoría.</p></div>}
          </section>
        </>
      ) : (
        <section className="discover-section-block">
          <div className="discover-section-head"><div><span>{directory === "talentos" ? "TALENTO" : "EMPRENDIMIENTOS"}</span><h2>{directory === "talentos" ? "Personas listas para crear, resolver y crecer" : "Negocios locales listos para conectar"}</h2></div><strong>{currentProfiles.length} resultados</strong></div>
          {currentProfiles.length ? <div className="discover-profile-grid">{currentProfiles.map((profile) => <DirectoryCard key={profile.id} profile={profile} />)}</div> : <div className="discover-empty-premium"><Search size={28} /><h3>No encontramos coincidencias</h3><p>Probá otra habilidad, ciudad o categoría.</p></div>}
        </section>
      )}
    </div>
  );
}

function DirectoryCard({ profile }: { profile: DirectoryProfile }) {
  const label = profile.kind === "empresa" ? "Empresa" : profile.kind === "negocio" ? "Emprendimiento" : "Talento";
  const href = profile.uid ? `/perfil/${profile.uid}` : undefined;
  const content = <><div className="directory-card-head"><span className="directory-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initials(profile.name)}</span><div><span>{label}</span><h3>{profile.name}</h3><p>{profile.role}</p></div>{profile.verified ? <BadgeCheck size={18} className="directory-verified" /> : null}</div><p className="directory-description">{profile.description}</p><div className="directory-tags">{profile.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="directory-card-footer"><span><MapPin size={14} /> {profile.location}</span><strong>{href ? "Ver perfil" : "Perfil demostrativo"} {href ? <ArrowRight size={14} /> : null}</strong></div></>;
  return href ? <Link href={href} className="directory-card">{content}</Link> : <article className="directory-card">{content}</article>;
}
