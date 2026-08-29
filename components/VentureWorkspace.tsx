"use client";

import Link from "next/link";
import {
  Check,
  ExternalLink,
  Handshake,
  LoaderCircle,
  LogOut,
  PackagePlus,
  Plus,
  Save,
  Store,
  Trash2,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";
import type { VentureProduct } from "@/lib/profile-types";

const ventureCategories = [
  "Agroindustria",
  "Economía circular",
  "Alimentos y bebidas",
  "Agricultura",
  "Artesanía",
  "Comercio",
  "Industria creativa",
  "Moda",
  "Servicios",
  "Tecnología",
  "Turismo",
  "Otros",
];

const needOptions = [
  "Clientes",
  "Alianzas comerciales",
  "Proveedores",
  "Financiamiento",
  "Espacios para comercialización",
  "Instituciones interesadas",
];

type VentureForm = {
  name: string;
  category: string;
  headline: string;
  description: string;
  location: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  services: string[];
  products: VentureProduct[];
  ventureNeeds: string[];
};

function emptyVenture(): VentureForm {
  return {
    name: "",
    category: "Servicios",
    headline: "",
    description: "",
    location: "",
    phone: "",
    website: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    services: [],
    products: [],
    ventureNeeds: [],
  };
}

function normalizeProducts(value: unknown): VentureProduct[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `legacy-${index}`,
        name: item,
        description: "",
        price: "",
        availability: "Consultar disponibilidad",
        imageUrl: "",
        storagePath: "",
      };
    }
    const data = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      id: String(data.id ?? `product-${index}`),
      name: String(data.name ?? ""),
      description: String(data.description ?? ""),
      price: String(data.price ?? ""),
      availability: String(data.availability ?? "Consultar disponibilidad"),
      imageUrl: String(data.imageUrl ?? ""),
      storagePath: String(data.storagePath ?? ""),
    };
  }).filter((item) => item.name.trim());
}

export function VentureWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VentureForm>(emptyVenture());
  const [servicesText, setServicesText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setReady(true);
  }), []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profileSnap = await getDoc(doc(db, "profiles", user!.uid));
        if (!active) return;

        if (!profileSnap.exists()) {
          const next = { ...emptyVenture(), name: user!.displayName ?? "" };
          setForm(next);
          setServicesText("");
          return;
        }

        const data = profileSnap.data();
        const social = data.socialLinks && typeof data.socialLinks === "object"
          ? data.socialLinks as Record<string, unknown>
          : {};
        const services = Array.isArray(data.services)
          ? data.services.map(String)
          : Array.isArray(data.skills) ? data.skills.map(String) : [];
        const next: VentureForm = {
          name: String(data.name ?? user!.displayName ?? ""),
          category: String(data.category ?? "Servicios"),
          headline: String(data.headline ?? data.profession ?? ""),
          description: String(data.description ?? ""),
          location: String(data.location ?? ""),
          phone: String(data.phone ?? ""),
          website: String(social.website ?? data.website ?? ""),
          instagram: String(social.instagram ?? ""),
          facebook: String(social.facebook ?? ""),
          tiktok: String(social.tiktok ?? ""),
          services,
          products: normalizeProducts(data.products),
          ventureNeeds: Array.isArray(data.ventureNeeds) ? data.ventureNeeds.map(String) : [],
        };
        setForm(next);
        setServicesText(services.join(", "));
      } catch (caught) {
        if (active) setError(firebaseMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [ready, user]);

  function patch<K extends keyof VentureForm>(key: K, value: VentureForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addProduct() {
    patch("products", [
      ...form.products,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        price: "",
        availability: "Consultar disponibilidad",
        imageUrl: "",
        storagePath: "",
      },
    ]);
  }

  function patchProduct(id: string, key: keyof VentureProduct, value: string) {
    patch("products", form.products.map((product) => product.id === id ? { ...product, [key]: value } : product));
  }

  function removeProduct(id: string) {
    patch("products", form.products.filter((product) => product.id !== id));
  }

  function toggleNeed(value: string) {
    patch("ventureNeeds", form.ventureNeeds.includes(value)
      ? form.ventureNeeds.filter((item) => item !== value)
      : [...form.ventureNeeds, value]);
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const userRef = doc(db, "users", user.uid);
      const profileRef = doc(db, "profiles", user.uid);
      const [userSnap, profileSnap] = await Promise.all([getDoc(userRef), getDoc(profileRef)]);
      const services = servicesText.split(",").map((item) => item.trim()).filter(Boolean);
      const products = form.products
        .map((product) => ({ ...product, name: product.name.trim(), description: product.description.trim(), price: product.price.trim(), availability: product.availability.trim() || "Consultar disponibilidad" }))
        .filter((product) => product.name);

      // Repair the private account document first. If a previous registration stopped
      // before creating profiles/{uid}, current rules permit correcting accountType.
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email ?? "",
        displayName: form.name.trim(),
        accountType: "negocio",
        updatedAt: serverTimestamp(),
        ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      const existing = profileSnap.exists() ? profileSnap.data() : null;
      await setDoc(profileRef, {
        ownerId: user.uid,
        kind: "negocio",
        name: form.name.trim(),
        category: form.category,
        profession: form.headline.trim(),
        headline: form.headline.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        coordinates: existing?.coordinates ?? null,
        locationPublic: existing?.locationPublic === true,
        phone: form.phone.trim(),
        socialLinks: {
          website: form.website.trim(),
          whatsapp: form.phone.trim(),
          facebook: form.facebook.trim(),
          instagram: form.instagram.trim(),
          tiktok: form.tiktok.trim(),
        },
        services,
        skills: services,
        products,
        ventureNeeds: form.ventureNeeds,
        avatarUrl: String(existing?.avatarUrl ?? ""),
        googlePhotoUrl: String(existing?.googlePhotoUrl ?? user.photoURL ?? ""),
        coverUrl: String(existing?.coverUrl ?? ""),
        portfolio: Array.isArray(existing?.portfolio) ? existing.portfolio : [],
        available: existing?.available !== false,
        status: "active",
        updatedAt: serverTimestamp(),
        ...(profileSnap.exists() ? {} : {
          verified: false,
          verificationStatus: "pending",
          verificationNote: "",
          partner: false,
          createdAt: serverTimestamp(),
        }),
      }, { merge: true });

      setForm((current) => ({ ...current, services, products }));
      setServicesText(services.join(", "));
      setNotice("Emprendimiento guardado correctamente en Firestore.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <main className="profile-private-page"><div className="profile-loading"><LoaderCircle className="spin" size={28} /> Cargando emprendimiento...</div></main>;
  }

  if (!user) {
    return <main className="profile-private-page"><section className="profile-auth-gate"><Store size={28} /><h1>Iniciá sesión para administrar tu emprendimiento.</h1><Link href="/entrar" className="btn btn-primary">Entrar</Link></section></main>;
  }

  return (
    <main className="profile-private-page">
      <section className="profile-dashboard-hero">
        <div className="shell profile-dashboard-hero-inner">
          <div><span className="eyebrow eyebrow-light">MI EMPRENDIMIENTO · GERMINA</span><h1>Hacé crecer tu emprendimiento.</h1><p>Administrá lo que ofrecés y las conexiones que estás buscando.</p></div>
          <Link href={`/perfil/${user.uid}`} className="btn btn-light">Ver perfil público <ExternalLink size={15} /></Link>
        </div>
      </section>

      <div className="shell profile-dashboard-shell">
        <aside className="profile-sidebar">
          <div className="profile-avatar-card"><span className="profile-avatar-xl"><Store size={38} /></span><strong>{form.name || user.displayName || "Emprendimiento"}</strong><span>{form.category}</span></div>
          <nav className="profile-section-nav"><a href="#informacion"><Store size={16} /> Información</a><a href="#productos"><PackagePlus size={16} /> Productos</a><a href="#buscamos"><Handshake size={16} /> Buscamos</a></nav>
          <button type="button" className="profile-logout" onClick={() => signOut(auth)}><LogOut size={15} /> Cerrar sesión</button>
        </aside>

        <div className="profile-editor-column">
          {notice ? <div className="profile-notice"><Check size={17} /> {notice}</div> : null}
          {error ? <div className="form-error" role="alert">{error}</div> : null}

          <section id="informacion" className="profile-editor-card reveal-card">
            <div className="profile-card-heading"><div><span className="profile-section-number">01</span><div><h2>Información del emprendimiento</h2><p>Estos datos alimentan la tarjeta y el perfil público.</p></div></div><span className="profile-privacy-badge public">Público</span></div>
            <div className="profile-editor-grid">
              <label><span>Nombre del emprendimiento</span><input value={form.name} onChange={(e) => patch("name", e.target.value)} /></label>
              <label><span>Categoría</span><select value={form.category} onChange={(e) => patch("category", e.target.value)}>{ventureCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="profile-field-wide"><span>Propuesta</span><input value={form.headline} onChange={(e) => patch("headline", e.target.value)} placeholder="Ej. Transformamos residuos en oportunidades" /></label>
              <label className="profile-field-wide"><span>Sobre el emprendimiento</span><textarea rows={5} value={form.description} onChange={(e) => patch("description", e.target.value)} /></label>
              <label><span>Ciudad / departamento</span><input value={form.location} onChange={(e) => patch("location", e.target.value)} /></label>
              <label><span>WhatsApp</span><input value={form.phone} onChange={(e) => patch("phone", e.target.value)} /></label>
              <label className="profile-field-wide"><span>Servicios</span><input value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder="Capacitaciones, distribución, asesoría..." /><small>Separalos con comas.</small></label>
              <label><span>Sitio web</span><input value={form.website} onChange={(e) => patch("website", e.target.value)} /></label>
              <label><span>Instagram</span><input value={form.instagram} onChange={(e) => patch("instagram", e.target.value)} /></label>
              <label><span>Facebook</span><input value={form.facebook} onChange={(e) => patch("facebook", e.target.value)} /></label>
              <label><span>TikTok</span><input value={form.tiktok} onChange={(e) => patch("tiktok", e.target.value)} /></label>
            </div>
          </section>

          <section id="productos" className="profile-editor-card reveal-card">
            <div className="profile-card-heading"><div><span className="profile-section-number">02</span><div><h2>Nuestros productos</h2><p>Agregá nombre, descripción, precio y disponibilidad.</p></div></div><button type="button" className="btn btn-secondary" onClick={addProduct}><Plus size={15} /> Agregar producto</button></div>
            {form.products.length ? <div className="profile-editor-column">{form.products.map((product, index) => <div className="profile-editor-card" key={product.id}><div className="profile-card-heading"><strong>Producto {index + 1}</strong><button type="button" className="profile-text-button" onClick={() => removeProduct(product.id)}><Trash2 size={14} /> Eliminar</button></div><div className="profile-editor-grid"><label><span>Nombre</span><input value={product.name} onChange={(e) => patchProduct(product.id, "name", e.target.value)} /></label><label><span>Precio</span><input value={product.price} onChange={(e) => patchProduct(product.id, "price", e.target.value)} placeholder="Opcional" /></label><label className="profile-field-wide"><span>Descripción</span><textarea rows={3} value={product.description} onChange={(e) => patchProduct(product.id, "description", e.target.value)} /></label><label className="profile-field-wide"><span>Disponibilidad</span><input value={product.availability} onChange={(e) => patchProduct(product.id, "availability", e.target.value)} /></label></div></div>)}</div> : <div className="profile-empty-gallery"><PackagePlus size={22} /> Todavía no agregaste productos.</div>}
          </section>

          <section id="buscamos" className="profile-editor-card reveal-card">
            <div className="profile-card-heading"><div><span className="profile-section-number">03</span><div><h2>Buscamos</h2><p>Indicá qué conexiones pueden ayudar a crecer al emprendimiento.</p></div></div><span className="profile-privacy-badge public">Público</span></div>
            <div className="venture-registration-needs"><div>{needOptions.map((item) => <label key={item}><input type="checkbox" checked={form.ventureNeeds.includes(item)} onChange={() => toggleNeed(item)} /><span>{item}</span></label>)}</div></div>
          </section>

          <div className="profile-save-bar"><div><strong>Guardá los cambios</strong><span>El perfil seguirá sujeto a aprobación administrativa.</span></div><button type="button" className="btn btn-primary btn-lg" disabled={saving} onClick={save}>{saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />} {saving ? "Guardando..." : "Guardar emprendimiento"}</button></div>
        </div>
      </div>
    </main>
  );
}
