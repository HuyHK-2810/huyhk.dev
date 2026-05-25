import Link from "next/link";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  getAllPosts,
  getAllTags,
} from "@/lib/posts";

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

export const metadata = {
  title: "Writing — huyHK",
  description:
    "Notes from 9 years of shipping software. Stories from the tester-to-fullstack journey.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

function resolveLocale(input: string | undefined): Locale {
  return (LOCALES as readonly string[]).includes(input ?? "")
    ? (input as Locale)
    : DEFAULT_LOCALE;
}

export default async function WritingIndex({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  const posts = getAllPosts(locale);
  const tags = getAllTags(locale);

  const labels =
    locale === "vi"
      ? {
          back: "← về trang chủ",
          section: "writing",
          title1: "Ghi chú tôi đang ",
          titleAccent: "viết",
          title2: ".",
          tagsLabel: "lọc theo chủ đề",
          allTags: "tất cả",
          rss: "RSS",
          minutes: "phút",
        }
      : {
          back: "← back home",
          section: "writing",
          title1: "Notes I’m ",
          titleAccent: "working on",
          title2: ".",
          tagsLabel: "filter by tag",
          allTags: "all",
          rss: "RSS",
          minutes: "min",
        };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/"
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            {labels.back}
          </Link>
          <div className="section-label mt-8 mb-4">{`{ ${labels.section} }`}</div>
          <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-normal leading-[1.1] tracking-tight text-ink">
            {labels.title1}
            <span className="italic text-ember">{labels.titleAccent}</span>
            {labels.title2}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[12px]">
            <Link
              href={`/writing${locale === "vi" ? "?lang=vi" : ""}`}
              className="rounded-full border border-ember bg-ember-soft px-3 py-1 text-ember-deep"
            >
              {labels.allTags} ({posts.length})
            </Link>
            {tags.slice(0, 8).map((t) => (
              <Link
                key={t.tag}
                href={`/writing/tags/${encodeURIComponent(t.tag)}${locale === "vi" ? "?lang=vi" : ""}`}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-ink-soft transition-colors hover:border-ember hover:text-ember"
              >
                {t.tag} <span className="text-ink-faint">({t.count})</span>
              </Link>
            ))}
            <a
              href="/feed.xml"
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-ink-soft transition-colors hover:border-ember hover:text-ember"
            >
              {labels.rss} ↗
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            <Link
              href="/writing"
              aria-current={locale === "en" ? "page" : undefined}
              className={[
                "rounded border px-2 py-0.5",
                locale === "en"
                  ? "border-ember bg-ember text-paper-pure"
                  : "border-[var(--line)] hover:border-ember hover:text-ember",
              ].join(" ")}
            >
              EN
            </Link>
            <Link
              href="/writing?lang=vi"
              aria-current={locale === "vi" ? "page" : undefined}
              className={[
                "rounded border px-2 py-0.5",
                locale === "vi"
                  ? "border-ember bg-ember text-paper-pure"
                  : "border-[var(--line)] hover:border-ember hover:text-ember",
              ].join(" ")}
            >
              VI
            </Link>
          </div>
        </div>

        <ul className="mt-12 flex max-w-[var(--container-prose)] flex-col">
          {posts.map((post, idx) => {
            const href = `/writing/${post.slug}${post.locale === "vi" ? "?lang=vi" : ""}`;
            return (
              <li
                key={`${post.slug}-${post.locale}`}
                className={idx > 0 ? "border-t border-[var(--line-soft)]" : ""}
              >
                <Link
                  href={href}
                  className="group block py-6 transition-all duration-300 hover:pl-2"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                    <h2 className="font-serif text-[20px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 font-mono text-[12px] text-ink-faint">
                      <time dateTime={post.date}>
                        {formatDate(post.date, locale)}
                      </time>
                      <span aria-hidden>·</span>
                      <span>
                        {post.readingMinutes} {labels.minutes}
                      </span>
                    </div>
                  </div>
                  {post.excerpt && (
                    <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-[var(--line-soft)] px-2 py-0.5 font-mono text-[11px] text-ink-faint"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
