"use client";

import { Crosshair, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import type { ProfileCoordinates } from "@/lib/profile-types";

type Props = {
  value: ProfileCoordinates | null;
  onChange?: (coordinates: ProfileCoordinates) => void;
  readOnly?: boolean;
};

export function ProfileLocationMap({ value, onChange, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const center: [number, number] = value ? [value.lat, value.lng] : [12.55, -85.65];
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      }).setView(center, value ? 13 : 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      if (value) {
        markerRef.current = L.circleMarker([value.lat, value.lng], {
          radius: 9,
          weight: 3,
          fillOpacity: 1,
        }).addTo(map);
      }

      if (!readOnly) {
        map.on("click", (event) => {
          const next = { lat: event.latlng.lat, lng: event.latlng.lng };
          if (markerRef.current) {
            markerRef.current.setLatLng(event.latlng);
          } else {
            markerRef.current = L.circleMarker(event.latlng, {
              radius: 9,
              weight: 3,
              fillOpacity: 1,
            }).addTo(map);
          }
          onChange?.(next);
        });
      }

      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 120);
    }

    setup();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    if (!value || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
  }, [value]);

  return (
    <div className={`profile-location-block ${readOnly ? "profile-location-readonly" : ""}`}>
      <div className="profile-location-heading">
        <span><MapPin size={17} /> {readOnly ? "Ubicación" : "Seleccioná tu ubicación"}</span>
        {!readOnly ? <small><Crosshair size={14} /> Hacé clic en el mapa para fijar el punto</small> : null}
      </div>
      <div ref={containerRef} className="profile-location-map" />
      {value ? (
        <div className="profile-coordinates">
          <span>Lat. {value.lat.toFixed(5)}</span>
          <span>Lng. {value.lng.toFixed(5)}</span>
          {!readOnly ? <small>La ubicación exacta solo se usa para posicionarte en el mapa de Germina.</small> : null}
        </div>
      ) : !readOnly ? (
        <div className="profile-map-empty">Todavía no has seleccionado un punto.</div>
      ) : null}
    </div>
  );
}
