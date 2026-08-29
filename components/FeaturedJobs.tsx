"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { JobPost } from "@/lib/marketplace-types";

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

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    const activeJobs = query(collection(db, "jobPosts"), where("status", "==", "active"));
    return onSnapshot(activeJobs, (snapshot) => {
      setJobs(snapshot.docs.map((item) => jobFromDoc(item.id, item.data())));
    }, () => setJobs([]));
  }, []);

  const featured = useMemo(() => [...jobs].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4), [jobs]);
  if (!featured.length) return null;

  return (
    <section className="section featured-jobs-section">
      <div className="shell">
        <div className="section-head split-head compact-head">
          <div><span className="eyebrow">OPORTUNIDADES ABIERTAS</span><h2>Vacantes para convertir talento en crecimiento.</h2></div>
          <Link className="text-link" href="/descubrir">Explorar empresas y vacantes <ArrowRight size={16} /></Link>
        </div>
        <div className="featured-jobs-grid">
          {featured.map((job) => (
            <Link href={`/vacante/${job.id}`} className="featured-job-card" key={job.id}>
              <div className="featured-job-company"><span>{job.companyLogo ? <img src={job.companyLogo} alt="" /> : <Building2 size={20} />}</span><div><strong>{job.companyName}</strong><small>{job.category}</small></div>{job.featured ? <em>Destacada</em> : null}</div>
              <h3>{job.title}</h3>
              <div className="featured-job-meta"><span><MapPin size={14} /> {job.location}</span><span><BriefcaseBusiness size={14} /> {job.modality}</span></div>
              <p>{job.description}</p>
              <div className="featured-job-footer"><span>{job.jobType}</span><strong>Ver vacante <ArrowRight size={15} /></strong></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
