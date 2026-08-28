import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, MapPinned, Search, Sparkles, UsersRound } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovingTicker } from "@/components/MovingTicker";
import { RealMap } from "@/components/RealMap";
import { TalentCard } from "@/components/TalentCard";
import { profiles, stats } from "@/lib/demo-data";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <MovingTicker />

      <section className="section intro-section">
        <div className="shell">
          <div className="section-head split-head">
            <div><span className="eyebrow">UNA VITRINA PARA LO QUE SABÉS HACER</span><h2>Tu talento no debería depender de que alguien lo descubra por casualidad.</h2></div>
            <p>Germina convierte habilidades, oficios y emprendimientos en perfiles visibles, buscables y conectados con personas o empresas que necesitan exactamente eso.</p>
          </div>
          <div className="value-grid">
            <article><span><UsersRound size={22} /></span><h3>Mostrá quién sos</h3><p>Un perfil pensado para habilidades, portafolio, ubicación y disponibilidad.</p><Link href="/crear-perfil">Crear perfil <ArrowRight size={15} /></Link></article>
            <article><span><Search size={22} /></span><h3>Dejate encontrar</h3><p>Aparecé en búsquedas por categoría, ciudad, habilidad y tipo de servicio.</p><Link href="/descubrir">Explorar talento <ArrowRight size={15} /></Link></article>
            <article><span><BriefcaseBusiness size={22} /></span><h3>Conectá con demanda</h3><p>Empresas y clientes pueden encontrar capacidad local antes de buscar lejos.</p><Link href="/empresas">Para empresas <ArrowRight size={15} /></Link></article>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-head split-head compact-head">
            <div><span className="eyebrow">TALENTO DESTACADO</span><h2>Personas y negocios listos para crecer.</h2></div>
            <Link className="text-link" href="/descubrir">Ver todos los perfiles <ArrowRight size={16} /></Link>
          </div>
          <div className="talent-grid home-talent-grid">{profiles.slice(0, 4).map((profile) => <TalentCard profile={profile} key={profile.id} />)}</div>
        </div>
      </section>

      <section className="section map-home-section">
        <div className="shell">
          <div className="section-head split-head compact-head">
            <div><span className="eyebrow">MAPA DE OPORTUNIDADES</span><h2>El talento tiene ubicación. Ahora también tiene visibilidad.</h2></div>
            <p>Usamos un mapa real de OpenStreetMap para mostrar dónde se encuentran perfiles y emprendimientos dentro de Nicaragua.</p>
          </div>
          <RealMap compact />
          <div className="map-home-footer"><div><MapPinned size={20} /><span><strong>Mapa real e interactivo</strong><small>Explorá talento por ciudad y departamento.</small></span></div><Link href="/mapa" className="btn btn-primary">Abrir mapa completo <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="section impact-section">
        <div className="shell impact-card">
          <div><span className="eyebrow eyebrow-light"><Sparkles size={14} /> DEL HOBBY AL NEGOCIO</span><h2>Una plataforma para que una habilidad pueda convertirse en el comienzo de algo más grande.</h2></div>
          <div className="impact-stats">{stats.map((stat) => <div key={stat.value + stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
          <div className="impact-actions"><Link href="/crear-perfil" className="btn btn-light btn-lg">Quiero germinar mi talento <ArrowRight size={18} /></Link><span><BadgeCheck size={17} /> Versión demostrativa · Rally Nacional 2026</span></div>
        </div>
      </section>
    </main>
  );
}
