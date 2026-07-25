import type { Metadata } from "next";
import Link from "next/link";

import { WritingList } from "@/components/writing-list";
import { getWritings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writings",
  description: "Notes on robots, strange planes, hardware, and other curiosities.",
};

export default function WritingsPage() {
  const writings = getWritings();

  return (
    <main className="writings-shell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Gabe Amare</Link>
        <span aria-hidden="true">•</span>
        <span>Writings</span>
      </nav>

      <section className="writings-index" aria-labelledby="writings-title">
        <h1 id="writings-title">Writings:</h1>
        <WritingList entries={writings} />
      </section>
    </main>
  );
}
