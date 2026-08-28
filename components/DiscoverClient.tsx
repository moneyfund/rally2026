"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { categories, profiles, type TalentProfile } from "@/lib/demo-data";
import { db } from "@/lib/firebase";
import { TalentCard } from "@/components/TalentCard";

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";
}

export function DiscoverClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [liveProfiles, setLiveProfiles] = useState<TalentProfile[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "profiles"),
      (snapshot) => {
        const items: TalentProfile[] = [];

        snapshot.docs.forEach((snapshotDoc, index) => {
          const data = snapshotDoc.data();
          if (data.status && data.status !== "active") return;

          const name = String(data.name ?? "Perfil Germina");
          const location = String(data.location ?? "Nicaragua");
          items.push({
            id: 10000 + index,
            name,
            role: String(data.headline ?? data.category ?? "Talento Germina"),
            category: String(data.category ?? "Servicios"),
            location,
            department: location,
            description: String(data.description ?? "Perfil creado en Germina."),
            skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
            rating: 0,
            reviews: 0,
            verified: Boolean(data.verified),
            available: data.available !== false,
            initials: initialsFrom(name),
            accent: "linear-gradient(135deg, #071d36, #315d89)",
            mapPosition: { x: 0, y: 0 },
            coordinates: { lat: 12.114, lng: -86.236 },
          });
        });

        setLiveProfiles(items);
      },
      () => {
        // Keep the demo profiles available until Firestore rules are published.
        setLiveProfiles([]);
      },
    );

    return unsubscribe;
  }, []);

  const allProfiles = useMemo(() => [...liveProfiles, ...profiles], [liveProfiles]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allProfiles.filter((profile) => {
      const matchesCategory = category === "Todos" || profile.category === category;
      const haystack = `${profile.name} ${profile.role} ${profile.location} ${profile.skills.join(" ")}`.toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [query, category, allProfiles]);

  return (
    <div className="discover-app">
      <div className="discover-toolbar">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscá por habilidad, nombre o ciudad" /></label>
        <button type="button" className="filter-button"><SlidersHorizontal size={17} /> Filtros</button>
      </div>
      <div className="category-tabs">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
      <div className="result-meta"><strong>{results.length} perfiles</strong><span>{liveProfiles.length ? `${liveProfiles.length} perfiles reales de Firestore + demostración` : "Talento y emprendimientos de demostración"}</span></div>
      {results.length ? <div className="talent-grid">{results.map((profile) => <TalentCard profile={profile} key={`${profile.id}-${profile.name}`} />)}</div> : <div className="empty-panel"><Search size={28} /><h3>No encontramos coincidencias</h3><p>Probá con otra habilidad o categoría.</p></div>}
    </div>
  );
}
