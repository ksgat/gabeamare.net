import Link from "next/link";

import { ActivityGraphs } from "@/components/activity-graphs";
import { WritingList } from "@/components/writing-list";
import {
  getGithubActivity,
  getHackatimeHeatmap,
} from "@/lib/activity";
import { writings } from "@/lib/content";

export const dynamic = "force-dynamic";

const socialLinks = [
  {
    label: "github",
    href: "https://github.com/ksgat",
  },
  {
    label: "twitter",
    href: "https://x.com/ksgat_",
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/ksgat",
  },
  {
    label: "hire me!",
    href: "hireme.pdf",
  },
];

export default async function Home() {
  const [githubActivity, hackatimeActivity] = await Promise.all([
    getGithubActivity("ksgat"),
    getHackatimeHeatmap("ksgat"),
  ]);

  return (
    <main className="home-shell">
      <section className="intro" aria-labelledby="intro-heading">
        <p className="eyebrow" id="intro-heading">
          Hi, I’m Gabe
        </p>

        <div className="bio-copy">
          <p>I am a 16 year old student-engineer from the DMV.</p>
          <p>
            I organize{" "}
            <a className="inline-link" href="https://www.hackthenest.org/">
              Hack The Nest
            </a>{" "}
            &amp;{" "}
            <a className="inline-link" href="https://tillyhacks.org">
              TillyHacks
            </a>
            , build both fighting and non fighting robots, and code.
          </p>
          <p>
            Currently, I am honing my craft and learning as much as possible.
            When not doing that I am usually climbing, cycling, or doing
            whatever satisfies my curiosity.
          </p>
        </div>
      </section>

      <section className="identity" aria-label="Gabe Amare">
        <div className="wordmark-wrap">
          <p className="dot-net">dot net!</p>
          <h1 className="wordmark" aria-label="Gabe Amare">
            <span>Gabe</span>
            <span>Amare</span>
          </h1>
        </div>

        <nav className="socials" aria-label="Social links">
          {socialLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
      </section>

      <section className="writing-preview" aria-labelledby="writing-heading">
        <div className="section-heading-row">
          <h2 id="writing-heading">Writings:</h2>
        </div>

        <WritingList compact entries={writings.slice(0, 3)} />

        <Link className="more-link" href="/writings">
          more<span aria-hidden="true">…</span>
          <span className="sr-only"> writings</span>
        </Link>
      </section>

      <ActivityGraphs
        github={githubActivity}
        hackatime={hackatimeActivity}
      />
    </main>
  );
}
