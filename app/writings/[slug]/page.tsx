import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getWritingBySlug, getWritings } from "@/lib/content";

type WritingPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getWritings().map((writing) => ({ slug: writing.slug }));
}

export async function generateMetadata({
  params,
}: WritingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);

  if (!writing) return {};

  return {
    title: writing.title,
    description: writing.subtitle,
  };
}

export default async function WritingPage({ params }: WritingPageProps) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);

  if (!writing) notFound();

  return (
    <main className="writings-shell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Gabe Amare</Link>
        <span aria-hidden="true">•</span>
        <Link href="/writings">Writings</Link>
      </nav>

      <article className="writing-post">
        <header className="writing-post__header">
          <p className="writing-post__date">
            <time dateTime={writing.date}>{formatDate(writing.date)}</time>
          </p>
          <h1>{writing.title}</h1>
          <p className="writing-post__subtitle">{writing.subtitle}</p>
        </header>

        <div
          className="writing-post__body"
          dangerouslySetInnerHTML={{ __html: writing.contentHtml }}
        />
      </article>
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
