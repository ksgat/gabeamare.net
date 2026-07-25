import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type Writing = {
  title: string;
  subtitle: string;
  slug: string;
  date: string;
  draft: boolean;
};

export type WritingPost = Writing & {
  contentHtml: string;
};

const writingsDirectory = path.join(process.cwd(), "content", "writings");

export function getWritings(options: { includeDrafts?: boolean } = {}) {
  const writings = getMarkdownFiles().map(readWritingMetadata);

  return writings
    .filter((writing) => options.includeDrafts || !writing.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getWritingBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<WritingPost | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const fileName = `${slug}.md`;
  if (!getMarkdownFiles().includes(fileName)) return null;

  const source = fs.readFileSync(
    path.join(writingsDirectory, fileName),
    "utf8",
  );
  const { data, content } = matter(source);
  const metadata = toWriting(fileName, data);

  if (metadata.draft && !options.includeDrafts) return null;

  const rendered = await remark().use(html).process(content);

  return {
    ...metadata,
    contentHtml: rendered.toString(),
  };
}

function getMarkdownFiles() {
  if (!fs.existsSync(writingsDirectory)) return [];

  return fs
    .readdirSync(writingsDirectory)
    .filter((fileName) => fileName.endsWith(".md"));
}

function readWritingMetadata(fileName: string) {
  const source = fs.readFileSync(
    path.join(writingsDirectory, fileName),
    "utf8",
  );
  const { data } = matter(source);

  return toWriting(fileName, data);
}

function toWriting(
  fileName: string,
  data: Record<string, unknown>,
): Writing {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error(`${fileName} is missing a title`);
  }

  if (typeof data.subtitle !== "string" || !data.subtitle.trim()) {
    throw new Error(`${fileName} is missing a subtitle`);
  }

  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? "");

  if (!date) {
    throw new Error(`${fileName} is missing a date`);
  }

  return {
    title: data.title,
    subtitle: data.subtitle,
    slug: fileName.replace(/\.md$/, ""),
    date,
    draft: data.draft === true,
  };
}
