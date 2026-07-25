import Link from "next/link";

import type { Writing } from "@/lib/content";

type WritingListProps = {
  entries: Writing[];
  compact?: boolean;
};

export function WritingList({
  entries,
  compact = false,
}: WritingListProps) {
  return (
    <ol className={`writing-list${compact ? " writing-list--compact" : ""}`}>
      {entries.map((writing, index) => (
        <li
          className="writing-list__item"
          key={writing.slug}
          style={{ "--item-index": index } as React.CSSProperties}
        >
          <Link
            className="writing-list__link"
            href={`/writings/${writing.slug}`}
          >
            <span className="writing-list__title">{writing.title}</span>
            <span className="writing-list__subtitle">{writing.subtitle}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
