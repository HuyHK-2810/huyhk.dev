import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import PostMeta from "@/components/writing/post-meta";
import PostFooter from "@/components/writing/post-footer";
import TableOfContents from "@/components/writing/toc";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  getAdjacentAsync,
  getAllSlugsAsync,
  getPostAsync,
  getRelatedAsync,
} from "@/lib/posts-db";
import { getPostFilename } from "@/lib/posts";
import { getHeadings } from "@/lib/toc";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";
import { isSupabaseConfigured } from "@/lib/supabase";

type Params = { slug: string };
type Search = { lang?: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllSlugsAsync();
  return slugs.map((slug) => ({ slug }));
}

function resolveLocale(input: string | undefined): Locale {
  return (LOCALES as readonly string[]).includes(input ?? "")
    ? (input as Locale)
    : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const post = await getPostAsync(slug, locale);
  if (!post) return { title: "Not found — huyHK" };
  const url = `/writing/${slug}${locale === "vi" ? "?lang=vi" : ""}`;
  return {
    title: `${post.title} — huyHK`,
    description: post.excerpt,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        post.availableLocales.map((l) => [
          l === "en" ? "en-US" : "vi-VN",
          l === "en" ? `/writing/${slug}` : `/writing/${slug}?lang=${l}`,
        ]),
      ),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function WritingPost({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  const post = await getPostAsync(slug, locale);
  if (!post) notFound();

  // Branch: DB-sourced posts have body inline; file-sourced posts dynamically import MDX.
  const sourcedFromDb = isSupabaseConfigured() && post.body.length > 0;

  let renderedHtml: string | null = null;
  let MdxBody: React.ComponentType | null = null;
  let headings: { depth: 2 | 3; text: string; id: string }[] = [];

  if (sourcedFromDb) {
    renderedHtml = await renderMarkdown(post.body);
    headings = extractHeadings(post.body);
  } else {
    const filename = getPostFilename(slug, post.locale);
    if (!filename) notFound();
    try {
      MdxBody = (await import(`@/content/posts/${filename}`)).default;
    } catch {
      notFound();
    }
    headings = getHeadings(filename);
  }

  const related = await getRelatedAsync(slug, post.locale);
  const { prev, next } = await getAdjacentAsync(slug, post.locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: post.locale === "vi" ? "vi-VN" : "en-US",
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
    author: {
      "@type": "Person",
      name: "Hồ Khắc Huy",
      url: "https://huyhk.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Hồ Khắc Huy",
      url: "https://huyhk.dev",
    },
    mainEntityOfPage: `https://huyhk.dev/writing/${slug}`,
  };

  const backLabel = post.locale === "vi" ? "← tất cả bài viết" : "← all writing";

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="grid gap-10 xl:grid-cols-[1fr_220px]">
          <div className="mx-auto w-full max-w-[var(--container-prose)] xl:mx-0">
            <Link
              href={`/writing${post.locale === "vi" ? "?lang=vi" : ""}`}
              className="font-mono text-[13px] text-ink-faint hover:text-ember"
            >
              {backLabel}
            </Link>

            <article className="mt-8">
              <PostMeta
                date={post.date}
                readingMinutes={post.readingMinutes}
                tags={post.tags}
                locale={post.locale}
                slug={slug}
                availableLocales={post.availableLocales}
              />
              <h1 className="mt-4 font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] tracking-tight text-ink">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 font-serif text-[19px] font-light leading-[1.55] text-ink-soft">
                  {post.excerpt}
                </p>
              )}

              <div className="prose-body mt-10">
                {renderedHtml ? (
                  <div
                    className="prose-body"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : MdxBody ? (
                  <MdxBody />
                ) : null}
              </div>

              <PostFooter
                prev={prev}
                next={next}
                related={related}
                locale={post.locale}
              />
            </article>
          </div>

          <aside className="hidden xl:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
