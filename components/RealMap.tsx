"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, MapPin, Navigation, Star } from "lucide-react";
import { profiles, type TalentProfile } from "@/lib/demo-data";

export function RealMap({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<TalentProfile>(profiles[0]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: !compact, zoomControl: true }).setView([12.55, -85.65], compact ? 6 : 7);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    profiles.forEach((profile) => {
      const marker = L.circleMarker([profile.coordinates.lat, profile.coordinates.lng], {
        radius: compact ? 8 : 10,
        color: "#ffffff",
        weight: 3,
        fillColor: "#0a2747",
        fillOpacity: 1,
      }).addTo(map);

      marker.bindTooltip(profile.name, { direction: "top", offset: [0, -10] });
      marker.on("click", () => setSelected(profile));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [compact]);

  return (
    <div className={compact ? "map-experience map-experience-compact" : "map-experience"}>
      <div ref={containerRef} className="real-map" aria-label="Mapa interactivo de talento en Nicaragua" />
      {!compact ? (
        <aside className="map-profile-panel">
          <span className="map-panel-kicker"><Navigation size={15} /> PERFIL SELECCIONADO</span>
          <div className="map-profile-head">
            <div className="talent-avatar" style={{ background: selected.accent }}>{selected.initials}</div>
            <div><div className="talent-title-row"><h3>{selected.name}</h3>{selected.verified ? <BadgeCheck size={17} /> : null}</div><p>{selected.role}</p></div>
          </div>
          <span className="talent-location"><MapPin size={14} /> {selected.location}, Nicaragua</span>
          <p className="map-profile-copy">{selected.description}</p>
          <div className="skill-row">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          <div className="map-profile-score"><span><Star size={15} fill="currentColor" /> {selected.rating.toFixed(1)}</span><span>{selected.reviews} reseñas</span></div>
          <button type="button" className="btn btn-primary map-contact">Ver perfil completo</button>
        </aside>
      ) : null}
    </div>
  );
}
