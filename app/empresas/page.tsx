import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { profiles } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Para empresas" };

export default function EmpresasPage() {
  return (
    <main>
      <section className="page-hero page-hero-business"><div className="shell"><span className="eyebrow">PARA EMPRESAS Y QUIENES CONTRATAN</span><h1>Encontrá capacidad local antes de buscar lejos.</h1><p>Descubrí personas, proveedores y emprendimientos según habilidad, ubicación y disponibilidad.</p><Link href="/descubrir" className="btn btn-primary btn-lg">Explorar talento <ArrowRight size={18} /></Link></div></section>
      <section className="section"><div className="shell business-page-grid"><div className="business-copy"><span className="eyebrow">UNA NUEVA FORMA DE BUSCAR</span><h2>Menos directorios genéricos. Más señales útiles.</h2><div className="business-feature"><Search size={20} /><div><strong>Búsqueda por necesidad</strong><p>Encontrá habilidades concretas, no solo cargos o nombres de empresas.</p></div></div><div className="business-feature"><MapPin size={20} /><div><strong>Contexto local</strong><p>Filtrá por ciudad y departamento para priorizar capacidad cercana.</p></div></div><div className="business-feature"><BadgeCheck size={20} /><div><strong>Señales de confianza</strong><p>La hoja de ruta incluye verificación, reputación, portafolio y disponibilidad.</p></div></div></div><div className="company-demo-panel"><div className="company-demo-head"><UsersRound size={21} /><div><strong>Resultados sugeridos</strong><span>Demo de búsqueda empresarial</span></div><SlidersHorizontal size={18} /></div>{profiles.slice(0,5).map((profile,index)=><article className="company-result" key={profile.id}><div className="talent-avatar talent-avatar-small" style={{background:profile.accent}}>{profile.initials}</div><div><strong>{profile.name}</strong><span>{profile.role} · {profile.location}</span></div><b>{96-index*4}%</b></article>)}</div></div></section>
      <section className="section section-soft"><div className="shell business-cta"><div><span className="eyebrow">PRÓXIMA ETAPA</span><h2>Cuenta empresarial, favoritos, vacantes y contacto directo.</h2><p>Estas funciones quedan preparadas para entrar cuando conectemos autenticación y Firebase.</p></div><Link href="/descubrir" className="btn btn-primary">Empezar a explorar <ArrowRight size={16} /></Link></div></section>
    </main>
  );
}
