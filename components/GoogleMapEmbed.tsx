import type { ProfileCoordinates } from "@/lib/profile-types";

export function GoogleMapEmbed({ coordinates, label }: { coordinates: ProfileCoordinates; label: string }) {
  const query = encodeURIComponent(`${coordinates.lat},${coordinates.lng}`);
  const src = `https://www.google.com/maps?q=${query}&z=15&output=embed`;

  return (
    <div className="google-map-embed">
      <iframe
        title={`Ubicación de ${label}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
