"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, ChevronDown, MapPin, Navigation, RotateCcw, Search, SlidersHorizontal, Star } from "lucide-react";
import { categories, profiles, type TalentProfile } from "@/lib/demo-data";
import styles from "./RealMap.module.css";

export function RealMap({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<TalentProfile | null>(profiles[0]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [department, setDepartment] = useState("Todos");
  const [availableOnly, setAvailableOnly] = useState(false);

  const departments = useMemo(
    () => ["Todos", ...Array.from(new Set(profiles.map((profile) => profile.department)))],
    [],
  );

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return profiles.filter((profile) => {
      const haystack = `${profile.name} ${profile.role} ${profile.category} ${profile.location} ${profile.department} ${profile.skills.join(" ")}`.toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesCategory = category === "Todos" || profile.category === category;
      const matchesDepartment = department === "Todos" || profile.department === department;
      const matchesAvailability = !availableOnly || profile.available;

      return matchesQuery && matchesCategory && matchesDepartment && matchesAvailability;
    });
  }, [availableOnly, category, department, query]);

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

    filteredProfiles.forEach((profile) => {
      const marker = L.circleMarker([profile.coordinates.lat, profile.coordinates.lng], {
        radius: compact ? 8 : 10,
        color: "#ffffff",
        weight: 3,
        fillColor: "#0a2747",
        fillOpacity: 1,
      }).addTo(markerGroup);

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
              <span className={styles.kicker}>MAPA DE TALENTO</span>
              <h1>Encontrá talento cerca de vos.</h1>
            </div>
            <span className={styles.resultCount}>{filteredProfiles.length} {filteredProfiles.length === 1 ? "resultado" : "resultados"}</span>
          </div>

          <div className={styles.filterBar}>
            <label className={styles.searchField}>
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar habilidad, negocio o persona"
                aria-label="Buscar talento en el mapa"
              />
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

            <button
              type="button"
              className={`${styles.availabilityButton} ${availableOnly ? styles.availabilityButtonActive : ""}`}
              onClick={() => setAvailableOnly((value) => !value)}
              aria-pressed={availableOnly}
            >
              <span className={styles.statusDot} /> Disponibles
            </button>

            {filtersActive ? (
              <button type="button" className={styles.resetButton} onClick={resetFilters} aria-label="Limpiar filtros">
                <RotateCcw size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={compact ? "" : styles.mapBody}>
        <div ref={containerRef} className={`real-map ${compact ? "" : styles.realMap}`} aria-label="Mapa interactivo de talento en Nicaragua" />

        {!compact ? (
          <aside className={`map-profile-panel ${styles.profilePanel}`}>
            {selected ? (
              <>
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
              </>
            ) : (
              <div className={styles.emptyPanel}>
                <Search size={24} />
                <strong>No encontramos perfiles</strong>
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
