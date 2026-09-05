import type { CSSProperties } from "react";

import { ActivityGraphs } from "@/components/activity-graphs";
import { ResidueLoader } from "@/components/residue-loader";
import { getGithubActivity, getHackatimeHeatmap } from "@/lib/activity";

import styles from "./home.module.css";

export const dynamic = "force-dynamic";

type Fraction = readonly [numerator: number, denominator: number];

const UNDERLINE_WINDOW_MS = 360;
const UNDERLINE_BRANCHES = [
  [1, 3],
  [1, 2],
  [2, 3],
  [2, 5],
  [3, 5],
] as const satisfies readonly Fraction[];

const SOCIAL_LINKS = [
  { label: "Github", href: "https://github.com/ksgat", timingRoot: [1, 2] },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/in/ksgat",
    timingRoot: [1, 3],
  },
  { label: "Twitter", href: "https://x.com/ksgat_", timingRoot: [2, 3] },
  {
    label: "Hireme!",
    href: "mailto:hello@gabeamare.net",
    timingRoot: [2, 5],
  },
] as const satisfies ReadonlyArray<{
  label: string;
  href: string;
  timingRoot: Fraction;
}>;

export default async function Home() {
  const [githubActivity, hackatimeActivity] = await Promise.all([
    getGithubActivity("ksgat"),
    getHackatimeHeatmap("ksgat"),
  ]);

  return (
    <main className={styles.page}>
      <ResidueLoader variant="legendre" primeOverride={57} minimal />

      <section className={styles.frame} aria-labelledby="site-title">
        <NamePanel />
        <AboutPanel />
        <ActivityGraphs
          github={githubActivity}
          hackatime={hackatimeActivity}
        />
        <SocialLinks />
      </section>
    </main>
  );
}

function NamePanel() {
  return (
    <div className={styles.namePanel}>
      <h1 id="site-title" className={styles.name} aria-label="Gabe Amare dot net">
        <span className={styles.nameLine} aria-hidden="true">
          <span className={styles.nameWord}>Gabe</span>
        </span>
        <span className={`${styles.nameLine} ${styles.domainLine}`} aria-hidden="true">
          <span className={styles.nameWord}>Amare</span>
          <small className={styles.domain}>(dot)net</small>
        </span>
      </h1>
    </div>
  );
}

function AboutPanel() {
  return (
    <section className={styles.about} aria-labelledby="about-heading">
      <p className={styles.aboutLabel} id="about-heading">
        Hi, I’m Gabe
      </p>
      <div className={styles.aboutCopy}>
        <p>I am a 16 year old student-engineer from the DMV.</p>
        <p>
          I organize <a href="https://www.hackthenest.org/">Hack The Nest</a>{" "}
          &amp; <a href="https://tillyhacks.org">TillyHacks</a>, build both
          fighting and non fighting robots, and code.
        </p>
        <p>
          Currently, I am honing my craft and learning as much as possible. When
          not doing that I am usually climbing, cycling, or doing whatever
          satisfies my curiosity.
        </p>
      </div>
    </section>
  );
}

function SocialLinks() {
  return (
    <nav className={styles.links} aria-label="Social links">
      {SOCIAL_LINKS.map((link) => (
        <a key={link.label} href={link.href}>
          <span>{link.label}</span>
          <span className={styles.underline} aria-hidden="true">
            {getUnderlineSegments(link.timingRoot).map((segment) => (
              <span
                key={segment.fraction}
                className={styles.underlineSegment}
                style={
                  {
                    "--underline-delay": `${segment.delay}ms`,
                    "--underline-duration": `${segment.duration}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </a>
      ))}
    </nav>
  );
}

function getUnderlineSegments(root: Fraction) {
  return UNDERLINE_BRANCHES.map((branch) => {
    const numerator = root[0] + branch[0];
    const denominator = root[1] + branch[1];
    const ratio = numerator / denominator;

    return {
      fraction: `${numerator}/${denominator}`,
      delay: Math.round(ratio * UNDERLINE_WINDOW_MS),
      duration: Math.round((1 - ratio) * UNDERLINE_WINDOW_MS),
    };
  });
}
