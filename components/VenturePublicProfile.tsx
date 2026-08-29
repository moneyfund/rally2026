"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  Globe2,
  Handshake,
  ImageIcon,
  Instagram,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Share2,
  ShoppingBag,
  Store,
  Truck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { GerminaProfile } from "@/lib/profile-types";
import { GoogleMapEmbed } from "@/components/GoogleMapEmbed";

const needIcons = {
  "Clientes": UsersRound,
  "Alianzas comerciales": Handshake,
  "Proveedores": Truck,
  "Financiamiento": WalletCards,
  "Espacios para comercialización": Store,
  "Instituciones interesadas": Landmark,
} as const;

function externalUrl(value: string) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function VenturePublicProfile({
  profile,
  whatsappUrl,
  mapsUrl,
}: {
  profile: GerminaProfile;
  whatsappUrl: string;
  mapsUrl: string;
}) {
  const avatar = profile.avatarUrl || profile.googlePhotoUrl;
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "G";
  const showMap = profile.locationPublic && Boolean(profile.coordinates);

  return (
    <main className="venture-public-page">
      <section
        className={`venture-public-hero ${profile.coverUrl ? "has-cover" : ""}`}
        style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined}
      >
        <div className="venture-public-overlay" />
        <div className="shell venture-public-hero-inner">
          <div className="venture-public-mark">{avatar ? <img src={avatar} alt={`Logo de ${profile.name}`} /> : initials}</div>
          <div className="venture-public-heading">
            <div className="venture-public-kicker"><span>EMPRENDIMIENTO</span>{profile.verified ? <strong><BadgeCheck size={15} /> Perfil verificado</strong> : null}</div>
            <h1>{profile.name}</h1>
            <p>{profile.headline || profile.profession || profile.category}</p>
            <div className="venture-public-meta"><span><MapPin size={15} /> {profile.location}</span><span><Store size={15} /> {profile.category}</span></div>
          </div>
          <div className="venture-public-actions">
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-light btn-lg"><MessageCircle size={17} /> Contactar</a> : null}
            <button type="button" className="venture-share" aria-label="Compartir emprendimiento" onClick={() => navigator.share?.({ title: profile.name, url: window.location.href })}><Share2 size={17} /></button>
          </div>
        </div>
      </section>

      <div className="shell venture-public-layout">
        <div className="venture-public-main">
          <section className="venture-section venture-about">
            <div className="venture-section-heading"><span><Store size={19} /></span><div><small>SOBRE NOSOTROS</small><h2>Conocé {profile.name}</h2></div></div>
            <p>{profile.description || "Este emprendimiento está completando su historia y propuesta de valor."}</p>
          </section>

          <section className="venture-section">
            <div className="venture-section-heading"><span><ShoppingBag size={19} /></span><div><small>NUESTROS PRODUCTOS</small><h2>Productos que ofrece el emprendimiento</h2></div></div>
            {profile.products.length ? (
              <div className="venture-product-grid">
                {profile.products.map((product, index) => {
                  const fallbackImage = profile.portfolio[index]?.url || "";
                  const image = product.imageUrl || fallbackImage;
                  return <article key={product.id} className="venture-product-card">
                    <div className="venture-product-image">{image ? <img src={image} alt={product.name} /> : <span><PackageCheck size={27} /></span>}</div>
                    <div className="venture-product-body"><div><small>PRODUCTO</small><h3>{product.name}</h3></div>{product.description ? <p>{product.description}</p> : null}<div className="venture-product-facts">{product.price ? <span><strong>Precio</strong>{product.price}</span> : null}<span><strong>Disponibilidad</strong>{product.availability || "Consultar"}</span></div></div>
                  </article>;
                })}
              </div>
            ) : <div className="venture-empty-block"><Boxes size={24} /><div><strong>Productos por agregar</strong><span>El emprendimiento todavía no ha publicado su catálogo.</span></div></div>}
          </section>

          <section className="venture-section">
            <div className="venture-section-heading"><span><PackageCheck size={19} /></span><div><small>NUESTROS SERVICIOS</small><h2>Servicios ofrecidos</h2></div></div>
            {profile.services.length ? <div className="venture-service-grid">{profile.services.map((service) => <span key={service}>{service}</span>)}</div> : <div className="venture-empty-block"><PackageCheck size={24} /><div><strong>Servicios por agregar</strong><span>Pronto habrá más información.</span></div></div>}
          </section>

          <section className="venture-section">
            <div className="venture-section-heading"><span><ImageIcon size={19} /></span><div><small>EVIDENCIAS</small><h2>Productos, procesos y participación</h2></div></div>
            <p className="venture-section-intro">Galería de productos, trabajos realizados, procesos, participación en ferias, reconocimientos y otros avances del emprendimiento.</p>
            {profile.portfolio.length ? <div className="venture-evidence-grid">{profile.portfolio.map((item) => <article key={item.id}><img src={item.url} alt={item.title} /><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div></article>)}</div> : <div className="venture-empty-block"><ImageIcon size={24} /><div><strong>Sin evidencias publicadas todavía</strong><span>Este espacio se irá llenando con el crecimiento del emprendimiento.</span></div></div>}
          </section>

          <section className="venture-section venture-looking-for">
            <div className="venture-section-heading"><span><Handshake size={19} /></span><div><small>BUSCAMOS</small><h2>Conexiones que pueden impulsar este emprendimiento</h2></div></div>
            <p className="venture-section-intro">Este perfil no solo muestra lo que ofrece: también comunica las oportunidades y relaciones que está buscando.</p>
            {profile.ventureNeeds.length ? <div className="venture-needs-grid">{profile.ventureNeeds.map((need) => { const Icon = needIcons[need as keyof typeof needIcons] || Handshake; return <div key={need}><span><Icon size={17} /></span><strong>{need}</strong></div>; })}</div> : <div className="venture-empty-block"><Handshake size={24} /><div><strong>Abierto a nuevas conexiones</strong><span>El emprendimiento aún no ha definido necesidades específicas.</span></div></div>}
          </section>

          {showMap && profile.coordinates ? <section className="venture-section"><div className="venture-section-heading"><span><MapPin size={19} /></span><div><small>UBICACIÓN</small><h2>{profile.location}</h2></div></div><GoogleMapEmbed coordinates={profile.coordinates} label={profile.name} />{mapsUrl ? <div className="business-location-actions"><a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary"><Navigation size={16} /> Abrir ruta</a></div> : null}</section> : null}
        </div>

        <aside className="venture-public-aside">
          <section className="venture-contact-card"><span>CONTACTÁ</span><h3>Conectá con {profile.name}</h3><p>Consultá productos, servicios, alianzas u oportunidades directamente con el emprendimiento.</p><div>{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>WhatsApp</span><b>↗</b></a> : null}{profile.socialLinks.website ? <a href={externalUrl(profile.socialLinks.website)} target="_blank" rel="noreferrer"><Globe2 size={17} /><span>Sitio web</span><b>↗</b></a> : null}{profile.socialLinks.instagram ? <a href={externalUrl(profile.socialLinks.instagram)} target="_blank" rel="noreferrer"><Instagram size={17} /><span>Instagram</span><b>↗</b></a> : null}</div></section>
          <section className="venture-trust-card"><BadgeCheck size={19} /><div><strong>{profile.verified ? "Emprendimiento verificado" : "Emprendimiento en Germina"}</strong><p>{profile.verified ? "Este perfil pasó por el proceso de revisión administrativa de Germina." : "La información corresponde a lo publicado por el propietario del emprendimiento."}</p></div></section>
          <Link href="/descubrir" className="venture-back-link">Volver a descubrir emprendimientos</Link>
        </aside>
      </div>
    </main>
  );
}
