import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <Link href="/" className="brand brand-footer" aria-label="Ir al inicio de Germina">
          <span className="brand-mark brand-mark-logo">
            <img src="/germina-logo.svg" alt="" />
          </span>
          <span className="brand-copy">
            <strong>GERMINA</strong>
            <small>DONDE EL TALENTO CRECE</small>
          </span>
        </Link>
      </div>
    </footer>
  );
}
