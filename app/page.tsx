import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, MapPinned, Search, Sparkles, UsersRound } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovingTicker } from "@/components/MovingTicker";
import { RealMap } from "@/components/RealMap";
import { TalentCard } from "@/components/TalentCard";
import { FeaturedJobs } from "@/components/FeaturedJobs";
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
            <p>Germina convierte habilidades, oficios, emprendimientos y empresas en perfiles visibles, buscables y conectados con oportunidades reales.</p>
          </div>
          <div className="value-grid">
            <article><span><UsersRound size={22} /></span><h3>Mostrá quién sos</h3><p>Un perfil pensado para habilidades, portafolio, ubicación y disponibilidad.</p><Link href="/crear-perfil">Crear perfil <ArrowRight size={15} /></Link></article>
            <article><span><Search size={22} /></span><h3>Dejate encontrar</h3><p>Aparecé en búsquedas por categoría, ciudad, habilidad y tipo de servicio.</p><Link href="/descubrir">Explorar Germina <ArrowRight size={15} /></Link></article>
            <article><span><BriefcaseBusiness size={22} /></span><h3>Conectá con oportunidades</h3><p>Empresas verificadas pueden publicar vacantes y conectar directamente con talento local.</p><Link href="/crear-perfil">Registrar empresa <ArrowRight size={15} /></Link></article>
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

      <FeaturedJobs />

      <section className="section map-home-section">
        <div className="shell">
          <div className="section-head split-head compact-head">
            <div><span className="eyebrow">MAPA DE UBICACIONES PÚBLICAS</span><h2>Personas y negocios que decidieron compartir dónde encontrarlos.</h2></div>
            <p>El mapa solo muestra puntos exactos cuando el propietario activa voluntariamente la opción de hacer pública su ubicación. Si no la activa, el punto permanece privado.</p>
          </div>
          <RealMap compact />
          <div className="map-home-footer"><div><MapPinned size={20} /><span><strong>Mapa real e interactivo</strong><small>Explorá únicamente ubicaciones autorizadas por sus propietarios.</small></span></div><Link href="/mapa" className="btn btn-primary">Abrir mapa completo <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="section impact-section">
        <div className="shell impact-card">
          <div><span className="eyebrow eyebrow-light"><Sparkles size={14} /> DEL HOBBY AL NEGOCIO</span><h2>Una plataforma para que una habilidad pueda convertirse en el comienzo de algo más grande.</h2></div>
          <div className="impact-stats">{stats.map((stat) => <div key={stat.value + stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
          <div className="impact-actions"><Link href="/crear-perfil" className="btn btn-light btn-lg">Quiero germinar mi talento <ArrowRight size={18} /></Link><span><BadgeCheck size={17} /> Rally Nacional 2026</span></div>
        </div>
      </section>
    </main>
  );
}
