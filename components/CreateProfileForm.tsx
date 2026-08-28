"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, MapPin, UserRound } from "lucide-react";
import { useState } from "react";

export function CreateProfileForm() {
  const [kind, setKind] = useState<"persona" | "negocio">("persona");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="success-card">
        <CheckCircle2 size={42} />
        <h2>Tu perfil demo está listo.</h2>
        <p>En la siguiente etapa conectaremos este flujo con Firebase para guardar cuentas, imágenes, portafolio y ubicación real.</p>
        <button type="button" className="btn btn-primary" onClick={() => setSubmitted(false)}>Editar información</button>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <div className="profile-type-grid">
        <button type="button" className={kind === "persona" ? "type-card active" : "type-card"} onClick={() => setKind("persona")}><UserRound size={23} /><strong>Soy talento</strong><span>Quiero mostrar mis habilidades y servicios.</span></button>
        <button type="button" className={kind === "negocio" ? "type-card active" : "type-card"} onClick={() => setKind("negocio")}><BriefcaseBusiness size={23} /><strong>Tengo un negocio</strong><span>Quiero promocionar mi emprendimiento.</span></button>
      </div>
      <div className="form-grid">
        <label><span>{kind === "persona" ? "Nombre completo" : "Nombre del negocio"}</span><input required placeholder={kind === "persona" ? "Ej. Ana Martínez" : "Ej. Taller Norte"} /></label>
        <label><span>Categoría</span><select required defaultValue=""><option value="" disabled>Seleccioná una categoría</option><option>Diseño</option><option>Tecnología</option><option>Fotografía</option><option>Gastronomía</option><option>Artesanía</option><option>Servicios</option></select></label>
        <label><span>Ciudad / departamento</span><div className="input-icon"><MapPin size={16} /><input required placeholder="Ej. Managua" /></div></label>
        <label><span>Teléfono o WhatsApp</span><input placeholder="+505 8888 8888" /></label>
        <label className="form-span"><span>¿Qué hacés?</span><input required placeholder="Ej. Diseño identidades visuales para pequeños negocios" /></label>
        <label className="form-span"><span>Contanos sobre tu trabajo</span><textarea required rows={5} placeholder="Describí tu experiencia, lo que ofrecés y qué tipo de oportunidades buscás." /></label>
        <label className="form-span"><span>Habilidades principales</span><input placeholder="Branding, fotografía, repostería..." /></label>
      </div>
      <div className="form-footer"><p>Al continuar aceptás que esta versión es una demostración del Rally 2026.</p><button className="btn btn-primary btn-lg" type="submit">Crear perfil demo <ArrowRight size={18} /></button></div>
    </form>
  );
}
