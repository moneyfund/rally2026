"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?auto=format&fit=crop&w=2200&q=88",
    place: "Isla de Ometepe",
    credit: "Sophie / Unsplash",
  },
  {
    image: "https://images.unsplash.com/photo-1742513225201-4fd1c738da61?auto=format&fit=crop&w=2200&q=88",
    place: "Granada",
    credit: "Rainer Eli / Unsplash",
  },
  {
    image: "https://images.unsplash.com/photo-1576515382035-a29a18c88b2d?auto=format&fit=crop&w=2200&q=88",
    place: "San Juan del Sur",
    credit: "Jezer Mejía / Unsplash",
  },
  {
    image: "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?auto=format&fit=crop&w=2200&q=88",
    place: "Granada colonial",
    credit: "Azzedine Rouichi / Unsplash",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5600);
    return () => window.clearInterval(timer);
  }, []);

  const go = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="photo-hero home-fullscreen-hero">
      <div className="hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`hero-photo ${index === active ? "hero-photo-active" : ""}`}
            key={slide.image}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>
      <div className="hero-shade" />

      <div className="shell hero-content">
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={15} /> Talento nicaragüense, visible y conectado</div>
          <p className="hero-brand-line">GERMINA</p>
          <h1>Donde el talento <span>crece.</span></h1>
          <p className="hero-lead">Mostrá lo que sabés hacer. Encontrá personas, servicios y emprendimientos. Convertí una habilidad en una oportunidad real.</p>
          <div className="hero-actions">
            <Link href="/crear-perfil" className="btn btn-light btn-lg">Crear mi perfil <ArrowRight size={18} /></Link>
            <Link href="/descubrir" className="btn btn-glass btn-lg"><Search size={18} /> Explorar talento</Link>
          </div>
        </div>

        <div className="hero-side-card">
          <span className="hero-card-label">AHORA EN GERMINA</span>
          <strong>Descubrí talento cerca de vos.</strong>
          <p>Diseño, tecnología, fotografía, gastronomía, artesanía y servicios en todo Nicaragua.</p>
          <Link href="/mapa">Explorar mapa <ArrowRight size={16} /></Link>
        </div>
      </div>

      <div className="shell hero-bottom">
        <div className="hero-location"><MapPin size={16} /><span>{slides[active].place}</span><small>Foto: {slides[active].credit}</small></div>
        <div className="hero-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft size={19} /></button>
          <div className="hero-dots">{slides.map((_, index) => <button aria-label={`Ir a imagen ${index + 1}`} type="button" className={index === active ? "dot-active" : ""} key={index} onClick={() => setActive(index)} />)}</div>
          <button type="button" onClick={() => go(1)} aria-label="Foto siguiente"><ChevronRight size={19} /></button>
        </div>
      </div>

      <a className="hero-scroll-cue" href="#inicio-contenido" aria-label="Deslizar hacia el contenido">
        <span>DESLIZÁ PARA DESCUBRIR</span>
        <span className="hero-scroll-arrows" aria-hidden="true"><ChevronDown size={17} /><ChevronDown size={17} /></span>
      </a>
    </section>
  );
}
