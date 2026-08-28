import { ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";
import type { TalentProfile } from "@/lib/demo-data";

type ProfileCardProps = {
  profile: TalentProfile;
  onOpen: (profile: TalentProfile) => void;
};

export function ProfileCard({ profile, onOpen }: ProfileCardProps) {
  return (
    <article className="profile-card">
      <div className="profile-card__top">
        <div className="profile-avatar" style={{ background: profile.accent }} aria-hidden="true">
          {profile.initials}
        </div>
        <div className="profile-card__meta">
          <div className="profile-card__name-row">
            <h3>{profile.name}</h3>
            {profile.verified && <BadgeCheck size={17} aria-label="Perfil verificado" />}
          </div>
          <p>{profile.role}</p>
        </div>
        <button className="icon-button" type="button" onClick={() => onOpen(profile)} aria-label={`Ver perfil de ${profile.name}`}>
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="profile-card__location">
        <MapPin size={15} />
        <span>{profile.location}, Nicaragua</span>
        {profile.available && <span className="availability"><i /> Disponible</span>}
      </div>

      <p className="profile-card__description">{profile.description}</p>

      <div className="tag-row">
        {profile.skills.map((skill) => (
          <span className="tag" key={skill}>{skill}</span>
        ))}
      </div>

      <div className="profile-card__footer">
        <div className="rating"><Star size={15} fill="currentColor" /> <strong>{profile.rating}</strong> <span>({profile.reviews})</span></div>
        <button className="text-link" type="button" onClick={() => onOpen(profile)}>Ver perfil</button>
      </div>
    </article>
  );
}
