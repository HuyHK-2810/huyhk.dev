import Link from "next/link";
import type { Locale } from "@/lib/posts";

type Props = {
  date: string;
  readingMinutes: number;
  tags: string[];
  locale: Locale;
  slug: string;
  availableLocales: Locale[];
};

function formatDate(iso: string, locale: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function PostMeta({
  date,
  readingMinutes,
  tags,
  locale,
  slug,
  availableLocales,
}: Props) {
  const minutesLabel = locale === "vi" ? "phút đọc" : "min read";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12px] text-ink-faint">
      <time dateTime={date} className="text-ember-deep">
        {formatDate(date, locale)}
      </time>
      <span aria-hidden>·</span>
      <span>
        {readingMinutes} {minutesLabel}
      </span>
      {tags.length > 0 && (
        <>
          <span aria-hidden>·</span>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/writing/tags/${encodeURIComponent(t)}${locale === "vi" ? "?lang=vi" : ""}`}
                  className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-ink-soft transition-colors hover:border-ember hover:text-ember"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {availableLocales.length > 1 && (
        <>
          <span aria-hidden>·</span>
          <div className="flex items-center gap-1">
            {availableLocales.map((l) => {
              const isActive = l === locale;
              const href =
                l === "en"
                  ? `/writing/${slug}`
                  : `/writing/${slug}?lang=${l}`;
              return (
                <Link
                  key={l}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em]",
                    isActive
                      ? "border-ember bg-ember text-paper-pure"
                      : "border-[var(--line)] text-ink-soft hover:border-ember hover:text-ember",
                  ].join(" ")}
                >
                  {l}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
