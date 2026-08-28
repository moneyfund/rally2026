"use client";

import { MapPin, Navigation, Search } from "lucide-react";
import type { TalentProfile } from "@/lib/demo-data";

type MapExplorerProps = {
  profiles: TalentProfile[];
  selectedId: number | null;
  onSelect: (profile: TalentProfile) => void;
};

export function MapExplorer({ profiles, selectedId, onSelect }: MapExplorerProps) {
  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];

  return (
    <div className="map-shell">
      <div className="map-panel">
        <div className="map-toolbar">
          <div className="map-search"><Search size={16} /><span>Explorar talento cerca de mí</span></div>
          <button className="map-location-button" type="button" aria-label="Usar mi ubicación"><Navigation size={17} /></button>
        </div>

        <div className="map-canvas" aria-label="Mapa de demostración de oportunidades en Nicaragua">
          <div className="map-grid" />
          <span className="map-label map-label--north">NORTE</span>
          <span className="map-label map-label--pacific">PACÍFICO</span>
          <span className="map-label map-label--caribbean">CARIBE</span>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className={`map-pin ${selectedId === profile.id ? "map-pin--active" : ""}`}
              style={{ left: `${profile.mapPosition.x}%`, top: `${profile.mapPosition.y}%` }}
              type="button"
              onClick={() => onSelect(profile)}
              aria-label={`Ver ${profile.name} en ${profile.location}`}
            >
              <MapPin size={18} fill="currentColor" />
            </button>
          ))}
          <div className="map-watermark">NICARAGUA</div>
        </div>
      </div>

      <aside className="map-detail-card">
        <div className="eyebrow">En el mapa</div>
        <div className="map-detail-card__head">
          <div className="profile-avatar profile-avatar--small" style={{ background: selected.accent }}>{selected.initials}</div>
          <div>
            <h3>{selected.name}</h3>
            <p>{selected.role}</p>
          </div>
        </div>
        <div className="map-detail-card__location"><MapPin size={15} /> {selected.location}, Nicaragua</div>
        <p>{selected.description}</p>
        <div className="tag-row">
          {selected.skills.slice(0, 3).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
        </div>
        <button className="button button--primary button--full" type="button" onClick={() => onSelect(selected)}>Ver perfil completo</button>
        <small>Mapa conceptual para esta primera versión. Luego conectaremos geolocalización y datos reales.</small>
      </aside>
    </div>
  );
}
