"use client";

import { BadgeCheck, BriefcaseBusiness, MapPin, MessageCircle, Star, X } from "lucide-react";
import type { TalentProfile } from "@/lib/demo-data";

type ProfileDialogProps = {
  profile: TalentProfile | null;
  onClose: () => void;
};

export function ProfileDialog({ profile, onClose }: ProfileDialogProps) {
  if (!profile) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card profile-dialog" role="dialog" aria-modal="true" aria-label={`Perfil de ${profile.name}`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        <div className="profile-dialog__hero" style={{ background: profile.accent }}>
          <div className="profile-dialog__avatar">{profile.initials}</div>
          <div>
            <div className="profile-dialog__title-row">
              <h2>{profile.name}</h2>
              {profile.verified && <BadgeCheck size={20} />}
            </div>
            <p>{profile.role}</p>
          </div>
        </div>

        <div className="profile-dialog__body">
          <div className="profile-dialog__facts">
            <span><MapPin size={16} /> {profile.location}, Nicaragua</span>
            <span><Star size={16} fill="currentColor" /> {profile.rating} · {profile.reviews} reseñas</span>
            <span><BriefcaseBusiness size={16} /> {profile.category}</span>
          </div>
          <h3>Sobre este perfil</h3>
          <p>{profile.description}</p>
          <div className="tag-row">
            {profile.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
          </div>
          <div className="profile-dialog__actions">
            <button className="button button--primary" type="button"><MessageCircle size={17} /> Contactar</button>
            <button className="button button--secondary" type="button">Guardar perfil</button>
          </div>
          <small>Los contactos, favoritos y mensajería se habilitarán al conectar la autenticación y Firebase.</small>
        </div>
      </section>
    </div>
  );
}
