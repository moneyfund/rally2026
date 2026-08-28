"use client";

import { ArrowRight, BriefcaseBusiness, Check, UserRound, X } from "lucide-react";
import { FormEvent, useState } from "react";

type CreateProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProfileModal({ open, onClose }: CreateProfileModalProps) {
  const [type, setType] = useState<"talent" | "business">("talent");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleClose() {
    setSubmitted(false);
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section className="modal-card onboarding-modal" role="dialog" aria-modal="true" aria-label="Crear perfil" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={handleClose} aria-label="Cerrar"><X size={19} /></button>

        {submitted ? (
          <div className="success-state">
            <div className="success-state__icon"><Check size={28} /></div>
            <div className="eyebrow">Perfil preparado</div>
            <h2>Esta experiencia ya está lista para conectarse a Firebase.</h2>
            <p>En esta versión los datos no se guardan todavía. El siguiente paso será autenticación, base de datos, almacenamiento de fotos y publicación real del perfil.</p>
            <button className="button button--primary" type="button" onClick={handleClose}>Entendido</button>
          </div>
        ) : (
          <>
            <div className="eyebrow">Empezá a mostrar lo que hacés</div>
            <h2>Creá tu perfil en Rally</h2>
            <p className="modal-intro">Una vitrina digital para tu talento, servicio o emprendimiento.</p>

            <div className="profile-type-grid">
              <button className={`profile-type ${type === "talent" ? "profile-type--active" : ""}`} type="button" onClick={() => setType("talent")}>
                <UserRound size={21} />
                <span><strong>Soy talento</strong><small>Quiero ofrecer mis habilidades o servicios.</small></span>
              </button>
              <button className={`profile-type ${type === "business" ? "profile-type--active" : ""}`} type="button" onClick={() => setType("business")}>
                <BriefcaseBusiness size={21} />
                <span><strong>Tengo un negocio</strong><small>Quiero promocionar mi emprendimiento.</small></span>
              </button>
            </div>

            <form className="onboarding-form" onSubmit={handleSubmit}>
              <label>
                Nombre {type === "business" ? "del negocio" : "completo"}
                <input required placeholder={type === "business" ? "Ej. Estudio Norte" : "Ej. María González"} />
              </label>
              <div className="form-grid">
                <label>
                  Categoría
                  <select defaultValue="">
                    <option value="" disabled>Seleccioná una</option>
                    <option>Diseño</option>
                    <option>Tecnología</option>
                    <option>Fotografía</option>
                    <option>Gastronomía</option>
                    <option>Artesanía</option>
                    <option>Servicios</option>
                  </select>
                </label>
                <label>
                  Departamento
                  <select defaultValue="Managua">
                    <option>Managua</option>
                    <option>León</option>
                    <option>Masaya</option>
                    <option>Granada</option>
                    <option>Estelí</option>
                    <option>Matagalpa</option>
                    <option>Otro</option>
                  </select>
                </label>
              </div>
              <label>
                Contanos qué hacés
                <textarea required rows={4} placeholder="Describí tus habilidades, productos o servicios..." />
              </label>
              <button className="button button--primary button--full" type="submit">Continuar <ArrowRight size={17} /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
