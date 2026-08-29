"use client";

import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Globe2,
  Instagram,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Share2,
  UserRound,
} from "lucide-react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { emptyProfile, type GerminaProfile } from "@/lib/profile-types";
import type { JobPost } from "@/lib/marketplace-types";
import { nicaraguaWhatsappUrl } from "@/lib/whatsapp";
import { GoogleMapEmbed } from "@/components/GoogleMapEmbed";

function normalizeProfile(uid: string, data: Record<string, unknown>): GerminaProfile {
  const social = data.socialLinks && typeof data.socialLinks === "object" ? data.socialLinks as Record<string, unknown> : {};
  const coords = data.coordinates && typeof data.coordinates === "object" ? data.coordinates as Record<string, unknown> : null;
  const kind = data.kind === "empresa" ? "empresa" : data.kind === "negocio" ? "negocio" : "persona";
  const coordinates = coords && typeof coords.lat === "number" && typeof coords.lng === "number" ? { lat: coords.lat, lng: coords.lng } : null;
  const legacyBusinessLocation = typeof data.locationPublic !== "boolean" && kind === "negocio" && Boolean(coordinates);
  const base = emptyProfile(uid);

  return {
    ...base,
    ownerId: uid,
    kind,
    name: String(data.name ?? "Perfil Germina"),
    category: String(data.category ?? "Servicios"),
    profession: String(data.profession ?? data.headline ?? ""),
    headline: String(data.headline ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? "Nicaragua"),
    coordinates,
    locationPublic: data.locationPublic === true || legacyBusinessLocation,
    phone: String(data.phone ?? ""),
    socialLinks: {
      website: String(social.website ?? data.website ?? ""),
      whatsapp: String(social.whatsapp ?? data.phone ?? ""),
      facebook: String(social.facebook ?? ""),
      instagram: String(social.instagram ?? ""),
      tiktok: String(social.tiktok ?? ""),
    },
    services: Array.isArray(data.services) ? data.services.map(String) : Array.isArray(data.skills) ? data.skills.map(String) : [],
    avatarUrl: String(data.avatarUrl ?? ""),
    googlePhotoUrl: String(data.googlePhotoUrl ?? ""),
    coverUrl: String(data.coverUrl ?? ""),
    portfolio: Array.isArray(data.portfolio) ? data.portfolio as GerminaProfile["portfolio"] : [],
    available: data.available !== false,
    verified: Boolean(data.verified),
    status: String(data.status ?? "active"),
    legalName: String(data.legalName ?? ""),
    companyEmail: String(data.companyEmail ?? ""),
    website: String(data.website ?? social.website ?? ""),
    representativeName: String(data.representativeName ?? ""),
    representativeRole: String(data.representativeRole ?? ""),
  };
}

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
    status: "active",
    featured: Boolean(data.featured),
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function externalUrl(value: string) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function directionsUrl(profile: GerminaProfile) {
  if (!profile.locationPublic || !profile.coordinates) return "";
  const { lat, lng } = profile.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function PublicProfile({ uid }: { uid: string }) {
  const [profile, setProfile] = useState<GerminaProfile | null>(null);
  const [companyJobs, setCompanyJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => onSnapshot(doc(db, "profiles", uid), (snapshot) => {
    if (!snapshot.exists()) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const next = normalizeProfile(uid, snapshot.data());
    if (next.status !== "active") setNotFound(true);
    else setProfile(next);
    setLoading(false);
  }, () => {
    setNotFound(true);
    setLoading(false);
  }), [uid]);

  useEffect(() => {
    if (profile?.kind !== "empresa") {
      setCompanyJobs([]);
      return;
    }
    const activeJobs = query(collection(db, "jobPosts"), where("status", "==", "active"));
    return onSnapshot(activeJobs, (snapshot) => {
      setCompanyJobs(snapshot.docs.map((item) => jobFromData(item.id, item.data())).filter((job) => job.companyId === uid));
    }, () => setCompanyJobs([]));
  }, [profile?.kind, uid]);

  const initials = useMemo(() => profile?.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "G", [profile]);
  const avatar = profile?.avatarUrl || profile?.googlePhotoUrl || "";

  if (loading) return <main className="public-profile-page"><div className="profile-loading"><LoaderCircle className="spin" size={28} /> Cargando perfil...</div></main>;
  if (notFound || !profile) return <main className="public-profile-page"><section className="public-profile-missing"><UserRound size={34} /><h1>Este perfil no está disponible.</h1><p>Puede que todavía no haya sido publicado o ya no esté activo.</p><Link href="/descubrir" className="btn btn-primary">Volver a descubrir</Link></section></main>;

  const whatsappUrl = nicaraguaWhatsappUrl(profile.socialLinks.whatsapp || profile.phone);
  const mapsUrl = directionsUrl(profile);
  const showMap = profile.locationPublic && Boolean(profile.coordinates);
  const isCompany = profile.kind === "empresa";
  const profileType = isCompany ? "EMPRESA" : profile.kind === "negocio" ? "EMPRENDIMIENTO" : "TALENTO GERMINA";

  return (
    <main className="public-profile-page">
      <section className={`public-profile-hero ${profile.coverUrl ? "public-profile-hero-with-cover" : ""}`} style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined}>
        <div className="shell public-profile-hero-inner">
          <div className="public-profile-avatar">{avatar ? <img src={avatar} alt={`Foto de ${profile.name}`} /> : <span>{initials}</span>}</div>
          <div className="public-profile-identity"><div className="public-profile-kicker"><span>{profileType}</span>{profile.verified ? <strong><BadgeCheck size={15} /> Verificado</strong> : null}</div><h1>{profile.name}</h1><p className="public-profile-profession">{profile.profession || profile.headline || profile.category}</p><div className="public-profile-facts"><span><MapPin size={15} /> {profile.location}</span><span><BriefcaseBusiness size={15} /> {profile.category}</span>{!isCompany ? <span className={profile.available ? "available" : ""}>{profile.available ? "Disponible" : "Con agenda"}</span> : <span className="available">Empresa verificada</span>}</div></div>
          <div className="public-profile-actions">{whatsappUrl ? <a className="btn btn-light btn-lg" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Contactar</a> : null}{mapsUrl ? <a className="btn btn-glass btn-lg" href={mapsUrl} target="_blank" rel="noreferrer"><Navigation size={18} /> Cómo llegar</a> : null}<button type="button" className="public-share-button" onClick={() => navigator.share?.({ title: profile.name, url: window.location.href })}><Share2 size={17} /></button></div>
        </div>
      </section>

      <div className="shell public-profile-layout">
        <div className="public-profile-main">
          <section className="public-profile-card"><span className="eyebrow">{isCompany ? "SOBRE LA EMPRESA" : "SOBRE MÍ"}</span><h2>{profile.headline || "Conocé este perfil"}</h2><p className="public-profile-description">{profile.description || "Este perfil todavía está completando su presentación."}</p>{profile.services.length ? <div className="public-service-tags">{profile.services.map((service) => <span key={service}>{service}</span>)}</div> : null}</section>

          {isCompany && companyJobs.length ? <section className="public-profile-card"><div className="public-section-heading"><div><span className="eyebrow">VACANTES ABIERTAS</span><h2>Oportunidades en {profile.name}</h2></div><span>{companyJobs.length} activas</span></div><div className="public-company-jobs">{companyJobs.map((job) => <Link key={job.id} href={`/vacante/${job.id}`}><span><Building2 size={18} /></span><div><strong>{job.title}</strong><small>{job.category} · {job.modality} · {job.location}</small></div><em>Ver vacante</em></Link>)}</div></section> : null}

          {!isCompany && profile.portfolio.length ? <section className="public-profile-card"><div className="public-section-heading"><div><span className="eyebrow">PORTAFOLIO</span><h2>Trabajo y servicios</h2></div><span>{profile.portfolio.length} publicaciones</span></div><div className="public-portfolio-grid">{profile.portfolio.map((item) => <article key={item.id}><div className="public-portfolio-image"><img src={item.url} alt={item.title} /></div><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div></article>)}</div></section> : null}

          {showMap && profile.coordinates ? <section className="public-profile-card public-location-card"><div className="public-section-heading"><div><span className="eyebrow">UBICACIÓN PÚBLICA</span><h2>{profile.location}</h2></div><span>Compartida por el propietario</span></div><GoogleMapEmbed coordinates={profile.coordinates} label={profile.name} /><div className="business-location-actions"><a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary"><Navigation size={16} /> Abrir ruta en Google Maps</a></div></section> : null}
        </div>

        <aside className="public-profile-aside">
          <section className="public-contact-card"><span className="eyebrow">CONECTÁ</span><h3>{isCompany ? "Conocé y contactá esta empresa." : profile.kind === "negocio" ? "Encontrá este emprendimiento fuera de Germina." : "Encontrá este talento fuera de Germina."}</h3><div className="public-social-links">{profile.socialLinks.website ? <a href={externalUrl(profile.socialLinks.website)} target="_blank" rel="noreferrer"><Globe2 size={17} /><span>Sitio web</span><span>↗</span></a> : null}{profile.socialLinks.instagram ? <a href={externalUrl(profile.socialLinks.instagram)} target="_blank" rel="noreferrer"><Instagram size={17} /><span>Instagram</span><span>↗</span></a> : null}{profile.socialLinks.facebook ? <a href={externalUrl(profile.socialLinks.facebook)} target="_blank" rel="noreferrer"><AtSign size={17} /><span>Facebook</span><span>↗</span></a> : null}{profile.socialLinks.tiktok ? <a href={externalUrl(profile.socialLinks.tiktok)} target="_blank" rel="noreferrer"><Music2 size={17} /><span>TikTok</span><span>↗</span></a> : null}{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>WhatsApp</span><span>↗</span></a> : null}{mapsUrl ? <a href={mapsUrl} target="_blank" rel="noreferrer"><Navigation size={17} /><span>Cómo llegar</span><span>↗</span></a> : null}</div></section>
          {isCompany ? <section className="public-profile-safety"><Building2 size={18} /><div><strong>Perfil empresarial verificado</strong><p>Las empresas pasan por revisión administrativa antes de publicar vacantes y aparecer en el directorio.</p></div></section> : <section className="public-profile-safety"><BadgeCheck size={18} /><div><strong>Privacidad en Germina</strong><p>La ubicación exacta solo aparece cuando el propietario activa voluntariamente su publicación.</p></div></section>}
        </aside>
      </div>
    </main>
  );
}
