"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "norvingarcia220@gmail.com";

const navItems = [
  { href: "/descubrir", label: "Descubrir" },
  { href: "/mapa", label: "Mapa" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/empresas", label: "Para empresas" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const updateHeader = () => setScrolled(window.scrollY > 44);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [isHome]);

  useEffect(() => setOpen(false), [pathname]);

  const isAdminUser = (user?.email ?? "").trim().toLowerCase() === ADMIN_EMAIL;

  const accountLink = user ? (
    <Link href={isAdminUser ? "/admin" : "/mi-perfil"} className="header-account" onClick={() => setOpen(false)}>
      <span className="header-account-avatar">
        {user.photoURL ? <img src={user.photoURL} alt="" /> : isAdminUser ? <ShieldCheck size={16} /> : <UserRound size={16} />}
      </span>
      <span>{isAdminUser ? "Administración" : "Mi perfil"}</span>
    </Link>
  ) : null;

  const headerState = isHome
    ? scrolled || open ? "site-header-home site-header-solid" : "site-header-home site-header-transparent"
    : "site-header-solid";

  return (
    <header className={`site-header ${headerState}`}>
      <div className="shell header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="Germina inicio">
          <span className="brand-mark brand-mark-logo"><img src="/germina-logo.svg" alt="" /></span>
          <span className="brand-copy"><strong>GERMINA</strong><small>DONDE EL TALENTO CRECE</small></span>
        </Link>

        <nav className={`nav ${open ? "nav-open" : ""}`} aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="mobile-nav-actions">
            {user ? accountLink : <><Link href="/entrar" className="btn btn-ghost" onClick={() => setOpen(false)}>Entrar</Link><Link href="/crear-perfil" className="btn btn-primary" onClick={() => setOpen(false)}>Crear perfil <ArrowRight size={16} /></Link></>}
          </div>
        </nav>

        <div className="header-actions">
          {user ? accountLink : <><Link href="/entrar" className="btn btn-ghost">Entrar</Link><Link href="/crear-perfil" className="btn btn-primary">Crear perfil <ArrowRight size={16} /></Link></>}
        </div>

        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
