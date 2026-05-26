import Link from "next/link";
import type { Locale, PostMeta } from "@/features/blog/lib/posts-db";

type Props = {
  prev: PostMeta | null;
  next: PostMeta | null;
  related: PostMeta[];
  locale: Locale;
};

function hrefFor(post: PostMeta, locale: Locale): string {
  const base = `/writing/${post.slug}`;
  return locale === "vi" && post.availableLocales.includes("vi")
    ? `${base}?lang=vi`
    : base;
}

export default function PostFooter({ prev, next, related, locale }: Props) {
  const labels =
    locale === "vi"
      ? {
          related: "bài liên quan",
          prev: "Bài trước",
          next: "Bài kế",
          subscribe: "Đăng ký để nhận bài mới",
          subscribeCta: "Theo dõi",
        }
      : {
          related: "related",
          prev: "Previous",
          next: "Next",
          subscribe: "Get new notes in your inbox",
          subscribeCta: "Subscribe",
        };

  return (
    <footer className="mt-16 border-t border-[var(--line-soft)] pt-10">
      {related.length > 0 && (
        <section className="mb-12">
          <div className="section-label mb-4">{`{ ${labels.related} }`}</div>
          <ul className="flex flex-col gap-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={hrefFor(p, locale)}
                  className="group flex flex-col gap-1 py-2 md:flex-row md:items-baseline md:justify-between md:gap-6"
                >
                  <span className="font-serif text-[17px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                    {p.title}
                  </span>
                  <span className="font-mono text-[12px] text-ink-faint">
                    {p.readingMinutes} {locale === "vi" ? "phút" : "min"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(prev || next) && (
        <nav className="grid gap-4 sm:grid-cols-2">
          <div>
            {prev ? (
              <Link
                href={hrefFor(prev, locale)}
                className="group flex flex-col gap-1 rounded-md border border-[var(--line-soft)] p-4 transition-colors hover:border-ember"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  ← {labels.prev}
                </span>
                <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                  {prev.title}
                </span>
              </Link>
            ) : null}
          </div>
          <div>
            {next ? (
              <Link
                href={hrefFor(next, locale)}
                className="group flex flex-col items-start gap-1 rounded-md border border-[var(--line-soft)] p-4 transition-colors hover:border-ember sm:items-end sm:text-right"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  {labels.next} →
                </span>
                <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </footer>
  );
}
