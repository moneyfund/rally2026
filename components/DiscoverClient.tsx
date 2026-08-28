"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, profiles } from "@/lib/demo-data";
import { TalentCard } from "@/components/TalentCard";

export function DiscoverClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesCategory = category === "Todos" || profile.category === category;
      const haystack = `${profile.name} ${profile.role} ${profile.location} ${profile.skills.join(" ")}`.toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [query, category]);

  return (
    <div className="discover-app">
      <div className="discover-toolbar">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscá por habilidad, nombre o ciudad" /></label>
        <button type="button" className="filter-button"><SlidersHorizontal size={17} /> Filtros</button>
      </div>
      <div className="category-tabs">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
      <div className="result-meta"><strong>{results.length} perfiles</strong><span>Talento y emprendimientos de demostración</span></div>
      {results.length ? <div className="talent-grid">{results.map((profile) => <TalentCard profile={profile} key={profile.id} />)}</div> : <div className="empty-panel"><Search size={28} /><h3>No encontramos coincidencias</h3><p>Probá con otra habilidad o categoría.</p></div>}
    </div>
  );
}
