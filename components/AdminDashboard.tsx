"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  LoaderCircle,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getBlob, ref } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";

type AdminTab = "overview" | "verification" | "talents" | "companies" | "documents";
type VerificationStatus = "pending" | "approved" | "rejected";

type AdminProfile = {
  id: string;
  ownerId: string;
  kind: "persona" | "negocio";
  name: string;
  category: string;
  profession: string;
  location: string;
  description: string;
  avatarUrl: string;
  googlePhotoUrl: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  verificationNote: string;
  partner: boolean;
  status: string;
  createdAt?: unknown;
};

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  accountType: string;
};

type AdminDocument = {
  id: string;
  ownerId: string;
  fileName: string;
  storagePath: string;
  contentType: string;
  size: number;
  documentType: string;
  createdAt?: unknown;
};

const navItems: Array<{ id: AdminTab; label: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "verification", label: "Verificación", icon: ShieldCheck },
  { id: "talents", label: "Talentos", icon: UsersRound },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "documents", label: "Documentos", icon: FileText },
];

function normalizeVerification(data: Record<string, unknown>): VerificationStatus {
  if (data.verificationStatus === "approved" || data.verificationStatus === "rejected" || data.verificationStatus === "pending") {
    return data.verificationStatus;
  }
  return data.verified === true ? "approved" : "pending";
}

function dateLabel(value: unknown) {
  if (!value || typeof value !== "object") return "Sin fecha";
  const maybeTimestamp = value as { toDate?: () => Date };
  if (typeof maybeTimestamp.toDate !== "function") return "Sin fecha";
  return new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric" }).format(maybeTimestamp.toDate());
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
}

function statusCopy(status: VerificationStatus) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

export function AdminDashboard() {
  const [access, setAccess] = useState<"loading" | "signedOut" | "forbidden" | "ready" | "error">("loading");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VerificationStatus>("all");
  const [selectedId, setSelectedId] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let cleanups: Array<() => void> = [];

    const clearDataListeners = () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      clearDataListeners();
      setError("");
      if (!currentUser) {
        if (!active) return;
        setAdminUser(null);
        setAccess("signedOut");
        return;
      }

      if (active) setAccess("loading");
      try {
        const token = await currentUser.getIdTokenResult(true);
        if (!active) return;
        if (token.claims.admin !== true) {
          setAdminUser(currentUser);
          setAccess("forbidden");
          return;
        }

        setAdminUser(currentUser);
        setAccess("ready");

        cleanups.push(onSnapshot(collection(db, "profiles"), (snapshot) => {
          if (!active) return;
          const next = snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              ownerId: String(data.ownerId ?? item.id),
              kind: data.kind === "negocio" ? "negocio" as const : "persona" as const,
              name: String(data.name ?? "Perfil sin nombre"),
              category: String(data.category ?? "Servicios"),
              profession: String(data.profession ?? data.headline ?? ""),
              location: String(data.location ?? "Nicaragua"),
              description: String(data.description ?? ""),
              avatarUrl: String(data.avatarUrl ?? ""),
              googlePhotoUrl: String(data.googlePhotoUrl ?? ""),
              verified: Boolean(data.verified),
              verificationStatus: normalizeVerification(data),
              verificationNote: String(data.verificationNote ?? ""),
              partner: Boolean(data.partner),
              status: String(data.status ?? "active"),
              createdAt: data.createdAt,
            } satisfies AdminProfile;
          });
          next.sort((a, b) => Number(a.verificationStatus === "pending") - Number(b.verificationStatus === "pending"));
          setProfiles(next);
        }, (caught) => setError(firebaseMessage(caught))));

        cleanups.push(onSnapshot(collection(db, "users"), (snapshot) => {
          if (!active) return;
          setUsers(snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              email: String(data.email ?? ""),
              displayName: String(data.displayName ?? ""),
              accountType: String(data.accountType ?? ""),
            };
          }));
        }, (caught) => setError(firebaseMessage(caught))));

        cleanups.push(onSnapshot(collectionGroup(db, "legalDocuments"), (snapshot) => {
          if (!active) return;
          setDocuments(snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              ownerId: item.ref.parent.parent?.id ?? "",
              fileName: String(data.fileName ?? "Documento"),
              storagePath: String(data.storagePath ?? ""),
              contentType: String(data.contentType ?? ""),
              size: Number(data.size ?? 0),
              documentType: String(data.documentType ?? "Documento"),
              createdAt: data.createdAt,
            };
          }));
        }, (caught) => setError(firebaseMessage(caught))));
      } catch (caught) {
        if (!active) return;
        setAccess("error");
        setError(firebaseMessage(caught));
      }
    });

    return () => {
      active = false;
      unsubscribeAuth();
      clearDataListeners();
    };
  }, []);

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const documentsByOwner = useMemo(() => {
    const map = new Map<string, AdminDocument[]>();
    documents.forEach((item) => map.set(item.ownerId, [...(map.get(item.ownerId) ?? []), item]));
    return map;
  }, [documents]);

  const pending = profiles.filter((profile) => profile.verificationStatus === "pending");
  const approved = profiles.filter((profile) => profile.verificationStatus === "approved");
  const rejected = profiles.filter((profile) => profile.verificationStatus === "rejected");
  const talents = profiles.filter((profile) => profile.kind === "persona");
  const companies = profiles.filter((profile) => profile.kind === "negocio");
  const partners = companies.filter((profile) => profile.partner);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    profiles.forEach((profile) => counts.set(profile.category, (counts.get(profile.category) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (tab === "verification" && profile.verificationStatus === "approved" && statusFilter === "all") return false;
      if (tab === "talents" && profile.kind !== "persona") return false;
      if (tab === "companies" && profile.kind !== "negocio") return false;
      if (statusFilter !== "all" && profile.verificationStatus !== statusFilter) return false;
      const account = usersById.get(profile.ownerId);
      const haystack = `${profile.name} ${profile.category} ${profile.profession} ${profile.location} ${account?.email ?? ""}`.toLowerCase();
      return !normalized || haystack.includes(normalized);
    });
  }, [profiles, search, statusFilter, tab, usersById]);

  const selectedProfile = profiles.find((profile) => profile.id === selectedId) ?? null;
  const selectedDocuments = selectedProfile ? documentsByOwner.get(selectedProfile.ownerId) ?? [] : [];

  useEffect(() => {
    if (selectedId && profiles.some((profile) => profile.id === selectedId)) return;
    const first = filteredProfiles[0] ?? profiles[0];
    setSelectedId(first?.id ?? "");
  }, [filteredProfiles, profiles, selectedId]);

  useEffect(() => {
    setReviewNote(selectedProfile?.verificationNote ?? "");
  }, [selectedProfile?.id, selectedProfile?.verificationNote]);

  async function updateVerification(profile: AdminProfile, action: "approve" | "reject") {
    if (!adminUser) return;
    if (action === "reject" && !reviewNote.trim()) {
      setError("Escribí un motivo antes de rechazar la solicitud.");
      return;
    }

    setBusyId(profile.id);
    setError("");
    try {
      await updateDoc(doc(db, "profiles", profile.id), {
        verified: action === "approve",
        verificationStatus: action === "approve" ? "approved" : "rejected",
        verificationNote: reviewNote.trim(),
        verificationReviewedAt: serverTimestamp(),
        verificationReviewedBy: adminUser.uid,
        status: "active",
      });
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusyId("");
    }
  }

  async function togglePartner(profile: AdminProfile) {
    setBusyId(profile.id);
    setError("");
    try {
      await updateDoc(doc(db, "profiles", profile.id), {
        partner: !profile.partner,
        partnerSince: profile.partner ? null : serverTimestamp(),
      });
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setBusyId("");
    }
  }

  async function openDocument(item: AdminDocument) {
    setError("");
    try {
      const blob = await getBlob(ref(storage, item.storagePath));
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      setError(firebaseMessage(caught));
    }
  }

  if (access === "loading") {
    return <main className="admin-access-page"><div className="admin-access-card"><LoaderCircle className="spin" size={30} /><strong>Validando acceso administrativo</strong><span>Conectando con Germina...</span></div></main>;
  }

  if (access === "signedOut") {
    return <main className="admin-access-page"><div className="admin-access-card"><ShieldCheck size={34} /><strong>Panel de administración</strong><span>Necesitás iniciar sesión con una cuenta autorizada.</span><Link href="/entrar" className="btn btn-primary">Iniciar sesión</Link></div></main>;
  }

  if (access === "forbidden") {
    return <main className="admin-access-page"><div className="admin-access-card admin-access-denied"><XCircle size={34} /><strong>Acceso restringido</strong><span>Esta cuenta no tiene permisos administrativos en Germina.</span><Link href="/" className="btn btn-ghost">Volver al sitio</Link></div></main>;
  }

  if (access === "error") {
    return <main className="admin-access-page"><div className="admin-access-card admin-access-denied"><XCircle size={34} /><strong>No pudimos abrir el panel</strong><span>{error || "Ocurrió un error al validar la sesión."}</span></div></main>;
  }

  return (
    <main className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link href="/" className="admin-brand">
            <span><img src="/germina-logo.svg" alt="" /></span>
            <div><strong>GERMINA</strong><small>ADMIN CONSOLE</small></div>
          </Link>

          <div className="admin-sidebar-label">OPERACIÓN</div>
          <nav className="admin-nav" aria-label="Secciones administrativas">
            {navItems.map((item) => {
              const Icon = item.icon;
              const badge = item.id === "verification" ? pending.length : item.id === "documents" ? documents.length : 0;
              return <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setStatusFilter("all"); }}><Icon size={18} /><span>{item.label}</span>{badge ? <em>{badge}</em> : null}</button>;
            })}
          </nav>

          <div className="admin-sidebar-health">
            <span><i /> Sistema operativo</span>
            <small>Datos sincronizados en tiempo real</small>
          </div>
          <button type="button" className="admin-signout" onClick={() => signOut(auth)}><LogOut size={16} /> Cerrar sesión</button>
        </aside>

        <section className="admin-content">
          <header className="admin-topbar">
            <div>
              <span className="admin-eyebrow">CONTROL GENERAL · RALLY 2026</span>
              <h1>{tab === "overview" ? "Centro de operaciones" : navItems.find((item) => item.id === tab)?.label}</h1>
            </div>
            <div className="admin-user-pill"><span>{adminUser?.photoURL ? <img src={adminUser.photoURL} alt="" /> : <UserRound size={17} />}</span><div><strong>{adminUser?.displayName || "Administrador"}</strong><small>{adminUser?.email}</small></div></div>
          </header>

          {error ? <div className="admin-error"><XCircle size={17} /> {error}<button type="button" onClick={() => setError("")}>Cerrar</button></div> : null}

          {tab === "overview" ? (
            <>
              <section className="admin-hero-card">
                <div><span><Sparkles size={15} /> PANEL DE CONFIANZA</span><h2>Todo Germina, bajo control.</h2><p>Revisá quién entra a la plataforma pública, validá documentación y mantené una visión clara del crecimiento por categoría.</p></div>
                <button type="button" onClick={() => setTab("verification")}><ShieldCheck size={18} /><span><strong>{pending.length} solicitudes</strong><small>requieren revisión</small></span><ChevronRight size={18} /></button>
              </section>

              <section className="admin-stat-grid">
                <article><span className="admin-stat-icon"><UsersRound size={20} /></span><div><small>Perfiles registrados</small><strong>{profiles.length}</strong><span>{talents.length} talentos · {companies.length} empresas</span></div></article>
                <article><span className="admin-stat-icon pending"><Clock3 size={20} /></span><div><small>Pendientes</small><strong>{pending.length}</strong><span>Esperando decisión</span></div></article>
                <article><span className="admin-stat-icon approved"><CheckCircle2 size={20} /></span><div><small>Aprobados</small><strong>{approved.length}</strong><span>Visibles públicamente</span></div></article>
                <article><span className="admin-stat-icon"><Building2 size={20} /></span><div><small>Empresas</small><strong>{companies.length}</strong><span>{partners.length} aliadas</span></div></article>
                <article><span className="admin-stat-icon"><FileCheck2 size={20} /></span><div><small>Documentos</small><strong>{documents.length}</strong><span>Archivos privados</span></div></article>
                <article><span className="admin-stat-icon rejected"><XCircle size={20} /></span><div><small>Rechazados</small><strong>{rejected.length}</strong><span>Con observaciones</span></div></article>
              </section>

              <section className="admin-overview-grid">
                <article className="admin-panel admin-category-panel">
                  <div className="admin-panel-heading"><div><span>DISTRIBUCIÓN</span><h3>Registros por categoría</h3></div><BarChart3 size={20} /></div>
                  <div className="admin-category-list">
                    {categoryData.length ? categoryData.map(([category, count]) => <div key={category}><div><strong>{category}</strong><span>{count} perfiles</span></div><div className="admin-progress"><i style={{ width: `${profiles.length ? Math.max(8, (count / profiles.length) * 100) : 0}%` }} /></div></div>) : <div className="admin-empty-mini">Todavía no hay registros.</div>}
                  </div>
                </article>

                <article className="admin-panel">
                  <div className="admin-panel-heading"><div><span>PRIORIDAD</span><h3>Cola de verificación</h3></div><ShieldCheck size={20} /></div>
                  <div className="admin-queue-list">
                    {pending.slice(0, 5).map((profile) => <button type="button" key={profile.id} onClick={() => { setSelectedId(profile.id); setTab("verification"); }}><span className="admin-mini-avatar">{initials(profile.name)}</span><div><strong>{profile.name}</strong><small>{profile.kind === "negocio" ? "Empresa" : "Talento"} · {documentsByOwner.get(profile.ownerId)?.length ?? 0} docs.</small></div><ChevronRight size={16} /></button>)}
                    {!pending.length ? <div className="admin-empty-mini"><CheckCircle2 size={21} /> No hay solicitudes pendientes.</div> : null}
                  </div>
                </article>

                <article className="admin-panel admin-partner-panel">
                  <div className="admin-panel-heading"><div><span>RED</span><h3>Empresas aliadas</h3></div><BriefcaseBusiness size={20} /></div>
                  <div className="admin-partner-count"><strong>{partners.length}</strong><span>empresas marcadas como aliadas</span></div>
                  <div className="admin-partner-chips">{partners.slice(0, 6).map((profile) => <span key={profile.id}>{profile.name}</span>)}{!partners.length ? <small>Podés marcar empresas aprobadas como aliadas desde la sección Empresas.</small> : null}</div>
                </article>
              </section>
            </>
          ) : tab === "documents" ? (
            <section className="admin-panel admin-table-panel">
              <div className="admin-list-header"><div><span>ARCHIVO PRIVADO</span><h2>Documentación subida</h2><p>Los documentos solo son visibles para su propietario y administradores autorizados.</p></div><div className="admin-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por usuario o documento" /></div></div>
              <div className="admin-document-table">
                <div className="admin-table-head"><span>Propietario</span><span>Documento</span><span>Tipo</span><span>Fecha</span><span /></div>
                {documents.filter((item) => {
                  const normalized = search.trim().toLowerCase();
                  const profile = profiles.find((current) => current.ownerId === item.ownerId);
                  return !normalized || `${profile?.name ?? ""} ${usersById.get(item.ownerId)?.email ?? ""} ${item.fileName} ${item.documentType}`.toLowerCase().includes(normalized);
                }).map((item) => {
                  const profile = profiles.find((current) => current.ownerId === item.ownerId);
                  return <div className="admin-table-row" key={`${item.ownerId}-${item.id}`}><span><strong>{profile?.name || usersById.get(item.ownerId)?.displayName || "Usuario"}</strong><small>{usersById.get(item.ownerId)?.email}</small></span><span><strong>{item.fileName}</strong><small>{(item.size / 1024 / 1024).toFixed(2)} MB</small></span><span><em>{item.documentType}</em></span><span>{dateLabel(item.createdAt)}</span><span><button type="button" onClick={() => openDocument(item)}>Abrir</button></span></div>;
                })}
                {!documents.length ? <div className="admin-table-empty"><FileText size={28} /><strong>No hay documentos cargados</strong><span>Cuando los usuarios suban archivos aparecerán aquí.</span></div> : null}
              </div>
            </section>
          ) : (
            <div className="admin-management-layout">
              <section className="admin-panel admin-table-panel">
                <div className="admin-list-header">
                  <div><span>{tab === "verification" ? "REVISIÓN" : tab === "companies" ? "DIRECTORIO EMPRESARIAL" : "DIRECTORIO DE TALENTO"}</span><h2>{tab === "verification" ? "Solicitudes de verificación" : tab === "companies" ? "Empresas registradas" : "Talentos registrados"}</h2><p>{filteredProfiles.length} registros en esta vista</p></div>
                  <div className="admin-list-tools"><div className="admin-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, correo o categoría" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="approved">Aprobados</option><option value="rejected">Rechazados</option></select></div>
                </div>
                <div className="admin-profile-list">
                  {filteredProfiles.map((profile) => {
                    const account = usersById.get(profile.ownerId);
                    const avatar = profile.avatarUrl || profile.googlePhotoUrl;
                    return <button type="button" className={selectedId === profile.id ? "active" : ""} key={profile.id} onClick={() => setSelectedId(profile.id)}><span className="admin-list-avatar">{avatar ? <img src={avatar} alt="" /> : initials(profile.name)}</span><span className="admin-list-main"><strong>{profile.name}</strong><small>{profile.profession || profile.category} · {profile.location}</small><em>{account?.email}</em></span>{profile.partner ? <span className="admin-partner-badge">Aliada</span> : null}<span className={`admin-status ${profile.verificationStatus}`}>{statusCopy(profile.verificationStatus)}</span><ChevronRight size={17} /></button>;
                  })}
                  {!filteredProfiles.length ? <div className="admin-table-empty"><Search size={28} /><strong>Sin resultados</strong><span>Ajustá la búsqueda o los filtros.</span></div> : null}
                </div>
              </section>

              <aside className="admin-inspector">
                {selectedProfile ? (
                  <>
                    <div className="admin-inspector-head"><span className="admin-inspector-avatar">{selectedProfile.avatarUrl || selectedProfile.googlePhotoUrl ? <img src={selectedProfile.avatarUrl || selectedProfile.googlePhotoUrl} alt="" /> : initials(selectedProfile.name)}</span><div><span className={`admin-status ${selectedProfile.verificationStatus}`}>{statusCopy(selectedProfile.verificationStatus)}</span><h2>{selectedProfile.name}</h2><p>{selectedProfile.kind === "negocio" ? "Empresa / emprendimiento" : "Talento / usuario"}</p></div></div>
                    <div className="admin-detail-grid"><div><span>Categoría</span><strong>{selectedProfile.category}</strong></div><div><span>Ubicación</span><strong>{selectedProfile.location}</strong></div><div><span>Correo</span><strong>{usersById.get(selectedProfile.ownerId)?.email || "No disponible"}</strong></div><div><span>Documentos</span><strong>{selectedDocuments.length}</strong></div></div>
                    {selectedProfile.description ? <p className="admin-profile-description">{selectedProfile.description}</p> : null}

                    <div className="admin-inspector-section"><div className="admin-inspector-title"><span>Documentación</span><strong>{selectedDocuments.length} archivos</strong></div>{selectedDocuments.length ? <div className="admin-inspector-docs">{selectedDocuments.map((item) => <button type="button" key={item.id} onClick={() => openDocument(item)}><FileText size={16} /><span><strong>{item.documentType}</strong><small>{item.fileName}</small></span><ChevronRight size={15} /></button>)}</div> : <div className="admin-no-docs"><FileText size={18} /> Sin documentos cargados.</div>}</div>

                    <div className="admin-inspector-section"><label className="admin-note-label"><span>Observación administrativa</span><textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Agregá una nota para la decisión o el motivo de rechazo..." /></label></div>

                    <div className="admin-review-actions"><button type="button" className="reject" disabled={busyId === selectedProfile.id} onClick={() => updateVerification(selectedProfile, "reject")}><XCircle size={17} /> Rechazar</button><button type="button" className="approve" disabled={busyId === selectedProfile.id} onClick={() => updateVerification(selectedProfile, "approve")}>{busyId === selectedProfile.id ? <LoaderCircle className="spin" size={17} /> : <BadgeCheck size={17} />} Aprobar y publicar</button></div>

                    {selectedProfile.kind === "negocio" && selectedProfile.verificationStatus === "approved" ? <button type="button" className={selectedProfile.partner ? "admin-partner-toggle active" : "admin-partner-toggle"} disabled={busyId === selectedProfile.id} onClick={() => togglePartner(selectedProfile)}><BriefcaseBusiness size={17} /><span><strong>{selectedProfile.partner ? "Empresa aliada" : "Marcar como empresa aliada"}</strong><small>{selectedProfile.partner ? "Aparece contabilizada en la red de aliados." : "Añadila a la red institucional de Germina."}</small></span></button> : null}
                  </>
                ) : <div className="admin-inspector-empty"><ShieldCheck size={28} /><strong>Seleccioná un registro</strong><span>Acá aparecerán sus datos y documentos.</span></div>}
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
