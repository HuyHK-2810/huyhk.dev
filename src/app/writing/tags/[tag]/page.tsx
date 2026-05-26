import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  getAllPostsAsync,
  getAllTagsAsync,
} from "@/features/blog/lib/posts-db";

type Params = { tag: string };

export async function generateStaticParams(): Promise<Params[]> {
  const seen = new Set<string>();
  for (const l of LOCALES) {
    for (const t of await getAllTagsAsync(l)) seen.add(t.tag);
  }
  return Array.from(seen).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

function resolveLocale(input: string | undefined): Locale {
  return (LOCALES as readonly string[]).includes(input ?? "")
    ? (input as Locale)
    : DEFAULT_LOCALE;
}

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

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `${decoded} — huyHK writing`,
    description: `Posts tagged ${decoded}.`,
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { tag } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const decoded = decodeURIComponent(tag);

  const all = await getAllPostsAsync(locale);
  const posts = all.filter((p) => p.tags.includes(decoded));
  if (posts.length === 0) notFound();

  const labels =
    locale === "vi"
      ? { back: "← tất cả bài viết", section: "tag", minutes: "phút" }
      : { back: "← all writing", section: "tag", minutes: "min" };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href={`/writing${locale === "vi" ? "?lang=vi" : ""}`}
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            {labels.back}
          </Link>
          <div className="section-label mt-8 mb-4">{`{ ${labels.section} }`}</div>
          <h1 className="font-serif text-[clamp(32px,5vw,44px)] font-normal leading-[1.1] tracking-tight text-ink">
            #<span className="italic text-ember">{decoded}</span>
          </h1>
          <p className="mt-3 font-mono text-[13px] text-ink-faint">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
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
                    <h2 className="font-serif text-[19px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
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
