import Link from "next/link";
import { Sprout } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-block">
          <Link href="/" className="brand brand-footer">
            <span className="brand-mark"><Sprout size={20} strokeWidth={2.2} /></span>
            <span className="brand-copy"><strong>GERMINA</strong><small>DONDE EL TALENTO CRECE</small></span>
          </Link>
          <p>Una plataforma para visibilizar habilidades, emprendimientos y oportunidades en Nicaragua.</p>
        </div>
        <div className="footer-links"><strong>Explorar</strong><Link href="/descubrir">Talento</Link><Link href="/mapa">Mapa</Link><Link href="/como-funciona">Cómo funciona</Link></div>
        <div className="footer-links"><strong>Participar</strong><Link href="/crear-perfil">Crear perfil</Link><Link href="/empresas">Para empresas</Link><Link href="/entrar">Entrar</Link></div>
        <div className="footer-note"><strong>Rally Nacional 2026</strong><span>Reto: Del hobby al negocio</span><span>Nicaragua</span></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Germina.</span><span>Construyendo conexiones alrededor del talento local.</span></div>
    </footer>
  );
}
