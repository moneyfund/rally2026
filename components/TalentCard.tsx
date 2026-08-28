import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { TalentProfile } from "@/lib/demo-data";

export function TalentCard({ profile, href, avatarUrl }: { profile: TalentProfile; href?: string; avatarUrl?: string }) {
  return (
    <article className="talent-card">
      <div className="talent-card-top">
        <div className="talent-avatar" style={avatarUrl ? undefined : { background: profile.accent }}>{avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : profile.initials}</div>
        <span className={profile.available ? "availability availability-on" : "availability"}>{profile.available ? "Disponible" : "Con agenda"}</span>
      </div>
      <div className="talent-title-row"><h3>{profile.name}</h3>{profile.verified ? <BadgeCheck size={17} /> : null}</div>
      <p className="talent-role">{profile.role}</p>
      <span className="talent-location"><MapPin size={14} /> {profile.location}</span>
      <p className="talent-description">{profile.description}</p>
      <div className="skill-row">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="talent-card-bottom"><span><Star size={15} fill="currentColor" /> {profile.rating.toFixed(1)} <small>({profile.reviews})</small></span>{href ? <Link href={href}>Ver perfil</Link> : <button type="button">Ver perfil</button>}</div>
    </article>
  );
}
