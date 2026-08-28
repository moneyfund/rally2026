import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Search, Sparkles, UserRound } from "lucide-react";

export const metadata: Metadata = { title: "Cómo funciona" };

const steps = [
  { number: "01", icon: UserRound, title: "Creá tu vitrina", text: "Armá un perfil con quién sos, qué hacés, dónde estás, tus habilidades y cómo pueden contactarte." },
  { number: "02", icon: Sparkles, title: "Hacete visible", text: "Tu perfil entra al buscador, categorías y mapa para que pueda ser descubierto por más personas." },
  { number: "03", icon: Search, title: "Llegá a oportunidades", text: "Clientes, empresas y organizaciones encuentran talento local según lo que necesitan." },
  { number: "04", icon: BadgeCheck, title: "Construí reputación", text: "Más adelante sumaremos verificación, reseñas, portafolio, favoritos y métricas de visibilidad." },
];

export default function ComoFuncionaPage() {
  return (
    <main>
      <section className="page-hero"><div className="shell"><span className="eyebrow">DEL HOBBY AL NEGOCIO</span><h1>Un camino simple entre saber hacer algo y encontrar quién lo necesita.</h1><p>Germina organiza el talento local para que sea visible, encontrable y conectable.</p></div></section>
      <section className="section"><div className="shell"><div className="process-grid">{steps.map(({ number, icon: Icon, title, text }) => <article className="process-card" key={number}><span className="process-number">{number}</span><div className="process-icon"><Icon size={23} /></div><h2>{title}</h2><p>{text}</p></article>)}</div></div></section>
      <section className="section section-soft"><div className="shell two-col-story"><div><span className="eyebrow">POR QUÉ EXISTE GERMINA</span><h2>Porque muchas habilidades ya generan valor antes de convertirse formalmente en un negocio.</h2></div><div><p>Una persona que cocina, diseña, repara, programa, fotografía o crea productos puede tener capacidad real, pero poca visibilidad. Germina reduce esa brecha con una presencia digital sencilla.</p><p>Del otro lado, empresas y personas necesitan resolver problemas todos los días. La plataforma conecta ambas necesidades en un mismo lugar.</p><Link href="/crear-perfil" className="btn btn-primary">Crear perfil <ArrowRight size={16} /></Link></div></div></section>
    </main>
  );
}
