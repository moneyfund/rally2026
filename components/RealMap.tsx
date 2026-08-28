"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, ChevronDown, MapPin, Navigation, RotateCcw, Search, SlidersHorizontal, Star } from "lucide-react";
import { collection, onSnapshot, query as firestoreQuery, where, type DocumentData, type QuerySnapshot } from "firebase/firestore";
import { categories, profiles, type TalentProfile } from "@/lib/demo-data";
import { db } from "@/lib/firebase";
import styles from "./RealMap.module.css";

type MapProfile = TalentProfile & {
  uid?: string;
  avatarUrl?: string;
};

const demoMapProfiles = profiles;
const VERIFICATION_ROLLOUT_AT = new Date("2026-08-28T22:51:00.000Z");

function initialsFrom(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
}

function directionsUrl(profile: MapProfile) {
  const { lat, lng } = profile.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

function sproutIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "germina-plant-marker",
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    tooltipAnchor: [0, -34],
    html: `<span class="germina-plant-marker-inner" aria-hidden="true"><svg viewBox="0 0 40 50" role="presentation" xmlns="http://www.w3.org/2000/svg"><path d="M20 2C11.16 2 4 9.16 4 18c0 12.16 14.08 26.7 15.1 27.73a1.3 1.3 0 0 0 1.8 0C21.92 44.7 36 30.16 36 18 36 9.16 28.84 2 20 2Z" fill="#3B5263"/><path d="M20 25c-1.3-4.1.55-8.1 5.05-10.4.5 3.85-1.3 7.15-5.05 10.4Zm0 0c-3.9-1.6-6.1-4.45-6.5-9.05 4 .65 6.4 3.05 6.5 9.05Zm0 0v4.3" fill="none" stroke="#FFFFFF" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
  });
}

function snapshotToMapProfiles(snapshot: QuerySnapshot<DocumentData>, idOffset: number): MapProfile[] {
  const items: MapProfile[] = [];

  snapshot.docs.forEach((snapshotDoc, index) => {
    const data = snapshotDoc.data();
    if (data.status && data.status !== "active") return;
    const kind = data.kind === "negocio" ? "negocio" : "persona";
    const legacyBusinessPublic = typeof data.locationPublic !== "boolean" && kind === "negocio";
    if (data.locationPublic !== true && !legacyBusinessPublic) return;

    const coords = data.coordinates && typeof data.coordinates === "object" ? data.coordinates as Record<string, unknown> : null;
    if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") return;

    const name = String(data.name ?? "Perfil Germina");
    const location = String(data.location ?? "Nicaragua");
    const services = Array.isArray(data.services) ? data.services.map(String) : Array.isArray(data.skills) ? data.skills.map(String) : [];
    const legacyProfile = data.verificationStatus == null;

    items.push({
      id: idOffset + index,
      uid: snapshotDoc.id,
      avatarUrl: String(data.avatarUrl ?? data.googlePhotoUrl ?? ""),
      kind,
      name,
      role: String(data.profession ?? data.headline ?? data.category ?? (kind === "negocio" ? "Negocio Germina" : "Talento Germina")),
      category: String(data.category ?? "Servicios"),
      location,
      department: location,
      description: String(data.description ?? "Perfil creado en Germina."),
      skills: services,
      rating: 0,
      reviews: 0,
      verified: data.verified === true || legacyProfile,
      available: data.available !== false,
      initials: initialsFrom(name),
      accent: "linear-gradient(135deg, #071d36, #315d89)",
      mapPosition: { x: 0, y: 0 },
      coordinates: { lat: coords.lat, lng: coords.lng },
    });
  });

  return items;
}

export function RealMap({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [liveProfiles, setLiveProfiles] = useState<MapProfile[]>([]);
  const [selected, setSelected] = useState<MapProfile | null>(demoMapProfiles[0] ?? null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [department, setDepartment] = useState("Todos");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    let approvedProfiles: MapProfile[] = [];
    let legacyProfiles: MapProfile[] = [];

    const publish = () => {
      const merged = new Map<string, MapProfile>();
      [...legacyProfiles, ...approvedProfiles].forEach((profile) => {
        if (profile.uid) merged.set(profile.uid, profile);
      });
      setLiveProfiles(Array.from(merged.values()));
    };

    const approvedQuery = firestoreQuery(collection(db, "profiles"), where("verified", "==", true));
    const legacyQuery = firestoreQuery(collection(db, "profiles"), where("createdAt", "<", VERIFICATION_ROLLOUT_AT));

    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
      approvedProfiles = snapshotToMapProfiles(snapshot, 20000);
      publish();
    }, () => {
      approvedProfiles = [];
      publish();
    });

    const unsubscribeLegacy = onSnapshot(legacyQuery, (snapshot) => {
      legacyProfiles = snapshotToMapProfiles(snapshot, 40000);
      publish();
    }, () => {
      legacyProfiles = [];
      publish();
    });

    return () => {
      unsubscribeApproved();
      unsubscribeLegacy();
    };
  }, []);

  const allProfiles = useMemo<MapProfile[]>(() => [...liveProfiles, ...demoMapProfiles], [liveProfiles]);

  const departments = useMemo(
    () => ["Todos", ...Array.from(new Set(allProfiles.map((profile) => profile.department)))],
    [allProfiles],
  );

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allProfiles.filter((profile) => {
      const haystack = `${profile.name} ${profile.role} ${profile.category} ${profile.location} ${profile.department} ${profile.skills.join(" ")}`.toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesCategory = category === "Todos" || profile.category === category;
      const matchesDepartment = department === "Todos" || profile.department === department;
      const matchesAvailability = !availableOnly || profile.available;
      return matchesQuery && matchesCategory && matchesDepartment && matchesAvailability;
    });
  }, [allProfiles, availableOnly, category, department, query]);

  const filtersActive = query.trim() !== "" || category !== "Todos" || department !== "Todos" || availableOnly;

  useEffect(() => {
    let cancelled = false;
    async function setupMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        scrollWheelZoom: !compact,
        zoomControl: true,
        minZoom: 6,
      }).setView([12.7, -85.25], compact ? 7 : 8);
      mapRef.current = map;
      markerGroupRef.current = L.layerGroup().addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      setMapReady(true);
    }
    setupMap();
    return () => {
      cancelled = true;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      markerGroupRef.current = null;
      leafletRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current || !markerGroupRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();
    const icon = sproutIcon(L);

    filteredProfiles.forEach((profile) => {
      const marker = L.marker([profile.coordinates.lat, profile.coordinates.lng], { icon }).addTo(markerGroup);
      marker.bindTooltip(profile.name, { direction: "top", offset: [0, -10] });
      marker.on("click", () => setSelected(profile));
    });

    if (!compact) {
      if (filtersActive && filteredProfiles.length > 0) {
        const bounds = L.latLngBounds(filteredProfiles.map((profile) => [profile.coordinates.lat, profile.coordinates.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [46, 46], maxZoom: 10 });
      } else if (!filtersActive) {
        map.setView([12.7, -85.25], 8);
      }
    }
  }, [compact, filteredProfiles, filtersActive, mapReady]);

  useEffect(() => {
    if (selected && filteredProfiles.some((profile) => profile.id === selected.id)) return;
    setSelected(filteredProfiles[0] ?? null);
  }, [filteredProfiles, selected]);

  function resetFilters() {
    setQuery("");
    setCategory("Todos");
    setDepartment("Todos");
    setAvailableOnly(false);
  }

  return (
    <div className={`${compact ? "map-experience map-experience-compact" : styles.mapExperience} ${compact ? "" : styles.fullMapExperience}`}>
      {!compact ? (
        <div className={styles.searchArea}>
          <div className={styles.searchTopline}>
            <div>
              <span className={styles.kicker}>MAPA DE UBICACIONES PÚBLICAS</span>
              <h1>Encontrá talento, servicios y emprendimientos cerca de vos.</h1>
            </div>
            <span className={styles.resultCount}>{filteredProfiles.length} {filteredProfiles.length === 1 ? "resultado" : "resultados"}</span>
          </div>

          <div className={styles.filterBar}>
            <label className={styles.searchField}>
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar talento, negocio, servicio o categoría" aria-label="Buscar perfiles con ubicación pública" />
            </label>
            <label className={styles.selectField}>
              <SlidersHorizontal size={16} />
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
                {categories.map((item) => <option key={item} value={item}>{item === "Todos" ? "Todas las categorías" : item}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className={styles.selectField}>
              <MapPin size={16} />
              <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filtrar por departamento">
                {departments.map((item) => <option key={item} value={item}>{item === "Todos" ? "Todo Nicaragua" : item}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <button type="button" className={`${styles.availabilityButton} ${availableOnly ? styles.availabilityButtonActive : ""}`} onClick={() => setAvailableOnly((value) => !value)} aria-pressed={availableOnly}>
              <span className={styles.statusDot} /> Disponibles
            </button>
            {filtersActive ? <button type="button" className={styles.resetButton} onClick={resetFilters} aria-label="Limpiar filtros"><RotateCcw size={16} /></button> : null}
          </div>
        </div>
      ) : null}

      <div className={compact ? "" : styles.mapBody}>
        <div ref={containerRef} className={`real-map ${compact ? "" : styles.realMap}`} aria-label="Mapa interactivo de perfiles que autorizaron publicar su ubicación" />

        {!compact ? (
          <aside className={`map-profile-panel ${styles.profilePanel}`}>
            {selected ? (
              <>
                <span className="map-panel-kicker"><Navigation size={15} /> {selected.uid ? "UBICACIÓN AUTORIZADA" : "PERFIL DE DEMOSTRACIÓN"}</span>
                <div className="map-profile-head">
                  <div className="talent-avatar" style={selected.avatarUrl ? undefined : { background: selected.accent }}>{selected.avatarUrl ? <img src={selected.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : selected.initials}</div>
                  <div><div className="talent-title-row"><h3>{selected.name}</h3>{selected.verified ? <BadgeCheck size={17} /> : null}</div><p>{selected.role}</p></div>
                </div>
                <span className="talent-location"><MapPin size={14} /> {selected.location}</span>
                <p className="map-profile-copy">{selected.description}</p>
                <div className="skill-row">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <div className="map-profile-score"><span><Star size={15} fill="currentColor" /> {selected.rating.toFixed(1)}</span><span>{selected.reviews} reseñas</span></div>
                <div className="map-location-actions">
                  <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="btn btn-primary map-contact"><Navigation size={16} /> Cómo llegar</a>
                  {selected.uid ? <Link href={`/perfil/${selected.uid}`} className="btn btn-ghost map-contact">Ver perfil</Link> : null}
                </div>
              </>
            ) : (
              <div className={styles.emptyPanel}>
                <Search size={24} />
                <strong>No encontramos ubicaciones públicas</strong>
                <p>Probá cambiando la búsqueda o limpiando los filtros.</p>
                <button type="button" className="btn btn-primary" onClick={resetFilters}>Limpiar filtros</button>
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
