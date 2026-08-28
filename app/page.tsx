"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { CreateProfileModal } from "@/components/CreateProfileModal";
import { MapExplorer } from "@/components/MapExplorer";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileDialog } from "@/components/ProfileDialog";
import { categories, profiles, stats, type TalentProfile } from "@/lib/demo-data";

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null);
  const [mapSelectedId, setMapSelectedId] = useState<number | null>(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesCategory = activeCategory === "Todos" || profile.category === activeCategory;
      const haystack = `${profile.name} ${profile.role} ${profile.category} ${profile.location} ${profile.skills.join(" ")}`.toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [query, activeCategory]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("descubrir")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openMapProfile(profile: TalentProfile) {
    setMapSelectedId(profile.id);
    setSelectedProfile(profile);
  }

  return (
    <main>
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#inicio" aria-label="Rally inicio">
            <span className="brand-mark"><span>R</span></span>
            <span className="brand-copy"><strong>RALLY</strong><small>DEL HOBBY AL NEGOCIO</small></span>
          </a>

          <nav className={`main-nav ${mobileMenu ? "main-nav--open" : ""}`} aria-label="Navegación principal">
            <a href="#descubrir" onClick={() => setMobileMenu(false)}>Descubrir</a>
            <a href="#mapa" onClick={() => setMobileMenu(false)}>Mapa</a>
            <a href="#como-funciona" onClick={() => setMobileMenu(false)}>Cómo funciona</a>
            <a href="#empresas" onClick={() => setMobileMenu(false)}>Para empresas</a>
          </nav>

          <div className="nav-actions">
            <button className="button button--ghost nav-login" type="button">Entrar</button>
            <button className="button button--primary" type="button" onClick={() => setCreateOpen(true)}>Crear perfil <ArrowRight size={16} /></button>
          </div>

          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenu((value) => !value)} aria-label="Abrir menú">
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-orb hero-orb--one" />
        <div className="hero-orb hero-orb--two" />
        <div className="container hero-grid">
          <div className="hero-copy animate-in">
            <div className="hero-kicker"><Sparkles size={15} /> El talento de Nicaragua merece ser encontrado</div>
            <h1>Convertí lo que sabés hacer en una <span>oportunidad real.</span></h1>
            <p className="hero-lead">
              Una plataforma para que jóvenes, profesionales y emprendimientos muestren su trabajo, conecten con clientes y sean descubiertos por empresas en todo el país.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <Search size={20} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscá diseño, fotografía, repostería, tecnología..." aria-label="Buscar talento o servicios" />
              <button type="submit">Buscar</button>
            </form>

            <div className="hero-actions-mobile">
              <button className="button button--primary" type="button" onClick={() => setCreateOpen(true)}>Crear mi perfil <ArrowRight size={17} /></button>
              <a className="button button--secondary" href="#descubrir">Explorar talento</a>
            </div>

            <div className="trust-row">
              <span><ShieldCheck size={16} /> Perfiles verificables</span>
              <span><MapPin size={16} /> Talento local</span>
              <span><BriefcaseBusiness size={16} /> Conexión con empresas</span>
            </div>
          </div>

          <div className="hero-visual animate-in animate-in--delay">
            <div className="hero-dashboard">
              <div className="dashboard-topbar">
                <div><i /><i /><i /></div>
                <span>rally.ni</span>
                <BadgeCheck size={17} />
              </div>
              <div className="dashboard-content">
                <div className="mini-sidebar">
                  <span className="mini-sidebar__active"><Compass size={17} /></span>
                  <span><UsersRound size={17} /></span>
                  <span><MapPin size={17} /></span>
                  <span><BriefcaseBusiness size={17} /></span>
                </div>
                <div className="mini-feed">
                  <div className="mini-feed__title"><div><small>DESCUBRÍ</small><strong>Talento cerca de vos</strong></div><span><Search size={15} /></span></div>
                  <div className="mini-featured-card">
                    <div className="mini-avatar">AL</div>
                    <div><strong>Andrea López <BadgeCheck size={13} /></strong><span>Diseñadora de marca · Managua</span></div>
                    <i>4.9 ★</i>
                  </div>
                  <div className="mini-card-grid">
                    <div><span className="mini-initials">CM</span><strong>Desarrollo web</strong><small>León</small></div>
                    <div><span className="mini-initials">VR</span><strong>Fotografía</strong><small>Granada</small></div>
                  </div>
                  <div className="mini-map-preview">
                    <span className="mini-map-pin mini-map-pin--1"><MapPin size={15} fill="currentColor" /></span>
                    <span className="mini-map-pin mini-map-pin--2"><MapPin size={15} fill="currentColor" /></span>
                    <span className="mini-map-pin mini-map-pin--3"><MapPin size={15} fill="currentColor" /></span>
                    <small>Explorar en el mapa</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card floating-card--top"><span><Zap size={16} /></span><div><strong>Nuevo contacto</strong><small>Una empresa vio tu perfil</small></div></div>
            <div className="floating-card floating-card--bottom"><div className="pulse-dot" /><div><strong>Disponible</strong><small>Mostrá cuándo podés trabajar</small></div></div>
          </div>
        </div>

        <div className="container stats-strip">
          {stats.map((stat) => (
            <div key={stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>
          ))}
        </div>
      </section>

      <section className="section" id="descubrir">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <div className="eyebrow">Descubrí lo que Nicaragua sabe hacer</div>
              <h2>Talento y negocios que merecen visibilidad.</h2>
            </div>
            <p>Explorá perfiles por habilidad, ubicación o categoría. Esta primera versión usa perfiles demostrativos para diseñar la experiencia antes de conectar datos reales.</p>
          </div>

          <div className="discovery-controls">
            <div className="category-row" role="group" aria-label="Filtrar por categoría">
              {categories.map((category) => (
                <button className={activeCategory === category ? "category-pill category-pill--active" : "category-pill"} type="button" key={category} onClick={() => setActiveCategory(category)}>{category}</button>
              ))}
            </div>
            <label className="inline-search">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar resultados" />
            </label>
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="profile-grid">
              {filteredProfiles.map((profile) => <ProfileCard key={profile.id} profile={profile} onOpen={setSelectedProfile} />)}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} />
              <h3>No encontramos resultados</h3>
              <p>Probá otra búsqueda o seleccioná una categoría diferente.</p>
              <button className="button button--secondary" type="button" onClick={() => { setQuery(""); setActiveCategory("Todos"); }}>Limpiar filtros</button>
            </div>
          )}
        </div>
      </section>

      <section className="section section--navy" id="mapa">
        <div className="container">
          <div className="section-heading section-heading--light section-heading--split">
            <div>
              <div className="eyebrow eyebrow--light">Mapa de oportunidades</div>
              <h2>Encontrá talento donde está.</h2>
            </div>
            <p>La ubicación convierte la plataforma en una herramienta de descubrimiento local: clientes, empresas y comunidades pueden identificar quién ofrece qué, y dónde.</p>
          </div>
          <MapExplorer profiles={profiles} selectedId={mapSelectedId} onSelect={openMapProfile} />
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-heading section-heading--center">
            <div className="eyebrow">Simple para empezar. Potente para crecer.</div>
            <h2>Del hobby al negocio, en tres pasos.</h2>
            <p>Rally reduce la distancia entre saber hacer algo y encontrar una oportunidad para hacerlo crecer.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon"><UsersRound size={23} /></div>
              <h3>Creá tu vitrina</h3>
              <p>Contá quién sos, qué hacés, dónde estás y mostrale al país tus habilidades, productos o servicios.</p>
              <button className="text-link" type="button" onClick={() => setCreateOpen(true)}>Crear perfil <ChevronRight size={15} /></button>
            </article>
            <article className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon"><Sparkles size={23} /></div>
              <h3>Hacete visible</h3>
              <p>Tu perfil entra al buscador, categorías y mapa para que más personas descubran tu trabajo.</p>
              <a className="text-link" href="#mapa">Ver el mapa <ChevronRight size={15} /></a>
            </article>
            <article className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon"><Target size={23} /></div>
              <h3>Conectá con oportunidades</h3>
              <p>Empresas y clientes encuentran el talento que necesitan y pueden iniciar una conversación.</p>
              <a className="text-link" href="#empresas">Para empresas <ChevronRight size={15} /></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--soft" id="empresas">
        <div className="container business-grid">
          <div className="business-copy">
            <div className="eyebrow">Para empresas y quienes contratan</div>
            <h2>Encontrá capacidad local antes de buscar lejos.</h2>
            <p>Rally también es una herramienta para negocios que necesitan diseñadores, fotógrafos, desarrolladores, proveedores, servicios y nuevos colaboradores.</p>
            <div className="business-benefits">
              <span><i><Search size={17} /></i><div><strong>Búsqueda inteligente</strong><small>Por habilidad, categoría y ubicación.</small></div></span>
              <span><i><BadgeCheck size={17} /></i><div><strong>Perfiles confiables</strong><small>Con señales de verificación y reputación.</small></div></span>
              <span><i><MapPin size={17} /></i><div><strong>Talento cercano</strong><small>Descubrimiento geográfico en Nicaragua.</small></div></span>
            </div>
            <button className="button button--primary" type="button">Explorar como empresa <ArrowRight size={17} /></button>
          </div>

          <div className="business-panel">
            <div className="business-panel__header"><span><BriefcaseBusiness size={18} /></span><div><strong>Panel para empresas</strong><small>Vista conceptual · próxima etapa</small></div></div>
            <div className="business-search-row"><Search size={16} /><span>Diseñador de contenido en Managua</span><button>Buscar</button></div>
            <div className="business-results-label"><span>12 perfiles relevantes</span><small>Ordenados por coincidencia</small></div>
            {profiles.slice(0, 3).map((profile, index) => (
              <div className="business-result" key={profile.id}>
                <div className="profile-avatar profile-avatar--tiny" style={{ background: profile.accent }}>{profile.initials}</div>
                <div><strong>{profile.name}</strong><small>{profile.role} · {profile.location}</small></div>
                <span className="match-score">{96 - index * 5}% match</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-pattern" />
            <div>
              <div className="eyebrow eyebrow--light">Tu habilidad puede ser el comienzo</div>
              <h2>Lo que hoy hacés por pasión, mañana puede ser tu negocio.</h2>
              <p>Creá tu perfil, mostrale a Nicaragua lo que sabés hacer y empezá a construir nuevas oportunidades.</p>
            </div>
            <button className="button button--white" type="button" onClick={() => setCreateOpen(true)}>Crear mi perfil gratis <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <a className="brand brand--footer" href="#inicio">
              <span className="brand-mark"><span>R</span></span>
              <span className="brand-copy"><strong>RALLY</strong><small>DEL HOBBY AL NEGOCIO</small></span>
            </a>
            <p>Una plataforma creada para visibilizar el talento, las habilidades y los emprendimientos de Nicaragua.</p>
          </div>
          <div className="footer-links"><strong>Explorar</strong><a href="#descubrir">Talento</a><a href="#mapa">Mapa</a><a href="#como-funciona">Cómo funciona</a></div>
          <div className="footer-links"><strong>Participar</strong><button type="button" onClick={() => setCreateOpen(true)}>Crear perfil</button><a href="#empresas">Para empresas</a><span>Centro de ayuda</span></div>
          <div className="footer-status"><span><i /> Prototipo v0.1</span><small>Preparado para Firebase y Vercel.</small></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Rally. Hecho para el talento nicaragüense.</span><span>RALLY 2026 · Primera versión</span></div>
      </footer>

      <CreateProfileModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ProfileDialog profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </main>
  );
}
