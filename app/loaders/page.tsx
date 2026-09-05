import Link from "next/link";

import { ResidueLoader } from "@/components/residue-loader";

import styles from "./page.module.css";

const STUDIES = [
  {
    number: "01",
    title: "Quadratic congruence",
    description: "x² + y² ≡ t (mod p), with t advancing.",
    variant: "congruence",
  },
  {
    number: "02",
    title: "Legendre field",
    description: "Prime sequence 7 → 11 → 17 → 23.",
    variant: "legendre",
  },
] as const;

export default function LoaderStudies() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Arithmetic loading studies</h1>
        <Link href="/">Back to site</Link>
      </header>

      <section className={styles.grid} aria-label="Loader comparisons">
        {STUDIES.map((study) => (
          <article className={styles.study} key={study.number}>
            <div className={styles.stage}>
              <ResidueLoader variant={study.variant} demo />
            </div>
            <div className={styles.caption}>
              <span>{study.number}</span>
              <h2>{study.title}</h2>
              <p>{study.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
