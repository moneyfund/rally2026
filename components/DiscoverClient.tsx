"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { collection, onSnapshot, query as firestoreQuery, where, type QuerySnapshot, type DocumentData } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { categories, profiles, type TalentProfile } from "@/lib/demo-data";
import { db } from "@/lib/firebase";
import { TalentCard } from "@/components/TalentCard";

type DiscoverProfile = TalentProfile & {
  uid?: string;
  avatarUrl?: string;
};

const VERIFICATION_ROLLOUT_AT = new Date("2026-08-28T22:51:00.000Z");

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";
}

function snapshotToProfiles(snapshot: QuerySnapshot<DocumentData>, idOffset: number): DiscoverProfile[] {
  const items: DiscoverProfile[] = [];

  snapshot.docs.forEach((snapshotDoc, index) => {
    const data = snapshotDoc.data();
    if (data.status && data.status !== "active") return;

    const kind: "persona" | "negocio" = data.kind === "negocio" ? "negocio" : "persona";
    const name = String(data.name ?? "Perfil Germina");
    const location = String(data.location ?? "Nicaragua");
    const rawCoords = data.coordinates && typeof data.coordinates === "object" ? data.coordinates as Record<string, unknown> : null;
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
      coordinates: kind === "negocio" && rawCoords && typeof rawCoords.lat === "number" && typeof rawCoords.lng === "number"
        ? { lat: rawCoords.lat, lng: rawCoords.lng }
        : { lat: 0, lng: 0 },
    });
  });

  return items;
}

export function DiscoverClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [liveProfiles, setLiveProfiles] = useState<DiscoverProfile[]>([]);

  useEffect(() => {
    let approvedProfiles: DiscoverProfile[] = [];
    let legacyProfiles: DiscoverProfile[] = [];

    const publish = () => {
      const merged = new Map<string, DiscoverProfile>();
      [...legacyProfiles, ...approvedProfiles].forEach((profile) => {
        if (profile.uid) merged.set(profile.uid, profile);
      });
      setLiveProfiles(Array.from(merged.values()));
    };

    const approvedQuery = firestoreQuery(collection(db, "profiles"), where("verified", "==", true));
    const legacyQuery = firestoreQuery(collection(db, "profiles"), where("createdAt", "<", VERIFICATION_ROLLOUT_AT));

    const unsubscribeApproved = onSnapshot(
      approvedQuery,
      (snapshot) => {
        approvedProfiles = snapshotToProfiles(snapshot, 10000);
        publish();
      },
      () => {
        approvedProfiles = [];
        publish();
      },
    );

    const unsubscribeLegacy = onSnapshot(
      legacyQuery,
      (snapshot) => {
        legacyProfiles = snapshotToProfiles(snapshot, 30000);
        publish();
      },
      () => {
        legacyProfiles = [];
        publish();
      },
    );

    return () => {
      unsubscribeApproved();
      unsubscribeLegacy();
    };
  }, []);

  const allProfiles = useMemo<DiscoverProfile[]>(() => [...liveProfiles, ...profiles], [liveProfiles]);

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
      {results.length ? <div className="talent-grid">{results.map((profile) => <TalentCard profile={profile} key={`${profile.id}-${profile.name}`} href={profile.uid ? `/perfil/${profile.uid}` : undefined} avatarUrl={profile.avatarUrl} />)}</div> : <div className="empty-panel"><Search size={28} /><h3>No encontramos coincidencias</h3><p>Probá con otra habilidad o categoría.</p></div>}
    </div>
  );
}
