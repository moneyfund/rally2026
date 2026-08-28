import type { Metadata } from "next";
import { RealMap } from "@/components/RealMap";
import styles from "./mapa.module.css";

export const metadata: Metadata = { title: "Mapa de talento | Germina" };

export default function MapaPage() {
  return (
    <main className={styles.page}>
      <section className={styles.mapSection}>
        <div className="shell">
          <RealMap />
        </div>
      </section>
    </main>
  );
}
