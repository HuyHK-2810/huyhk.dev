import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export type Locale = "en" | "vi";
export const LOCALES: Locale[] = ["en", "vi"];
export const DEFAULT_LOCALE: Locale = "en";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags: string[];
  locale: Locale;
  /** Locales that have a file for this slug (so the UI knows whether to show a switcher). */
  availableLocales: Locale[];
  /** Minutes of reading, rounded. */
  readingMinutes: number;
  /** Raw word count (body only). */
  wordCount: number;
};

type FileParse = {
  slug: string;
  locale: Locale;
  data: Record<string, unknown>;
  body: string;
};

function parseFilename(filename: string): { slug: string; locale: Locale } | null {
  // Supported shapes:
  //   tester-dna.mdx           -> slug=tester-dna, locale=en (default)
  //   tester-dna.en.mdx        -> slug=tester-dna, locale=en
  //   tester-dna.vi.mdx        -> slug=tester-dna, locale=vi
  if (!filename.endsWith(".mdx")) return null;
  const base = filename.replace(/\.mdx$/, "");
  const m = base.match(/^(.+)\.(en|vi)$/);
  if (m) return { slug: m[1], locale: m[2] as Locale };
  return { slug: base, locale: DEFAULT_LOCALE };
}

function readAllFiles(): FileParse[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const out: FileParse[] = [];
  for (const f of files) {
    const parsed = parseFilename(f);
    if (!parsed) continue;
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
    const { data, content } = matter(raw);
    out.push({ slug: parsed.slug, locale: parsed.locale, data, body: content });
  }
  return out;
}

function toMeta(file: FileParse, availableLocales: Locale[]): PostMeta {
  const stats = readingTime(file.body);
  const tags = Array.isArray(file.data.tags)
    ? (file.data.tags as unknown[]).map(String)
    : [];
  return {
    slug: file.slug,
    title: String(file.data.title ?? file.slug),
    date: String(file.data.date ?? ""),
    excerpt: file.data.excerpt ? String(file.data.excerpt) : undefined,
    tags,
    locale: file.locale,
    availableLocales,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    wordCount: stats.words,
  };
}

/** All posts in the requested locale, falling back to default locale when missing. */
export function getAllPosts(locale: Locale = DEFAULT_LOCALE): PostMeta[] {
  const files = readAllFiles();

  // Group by slug.
  const bySlug = new Map<string, Map<Locale, FileParse>>();
  for (const f of files) {
    if (!bySlug.has(f.slug)) bySlug.set(f.slug, new Map());
    bySlug.get(f.slug)!.set(f.locale, f);
  }

  const posts: PostMeta[] = [];
  for (const [, perLocale] of bySlug) {
    const available = Array.from(perLocale.keys());
    const file = perLocale.get(locale) ?? perLocale.get(DEFAULT_LOCALE);
    if (!file) continue;
    posts.push(toMeta(file, available));
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  const slugs = new Set<string>();
  for (const f of readAllFiles()) slugs.add(f.slug);
  return Array.from(slugs);
}

export function getPost(slug: string, locale: Locale = DEFAULT_LOCALE): PostMeta | null {
  return getAllPosts(locale).find((p) => p.slug === slug) ?? null;
}

/** Resolve which on-disk filename to import for a given slug + locale. */
export function getPostFilename(slug: string, locale: Locale): string | null {
  if (!fs.existsSync(POSTS_DIR)) return null;
  const candidates = [`${slug}.${locale}.mdx`, `${slug}.mdx`];
  for (const c of candidates) {
    if (fs.existsSync(path.join(POSTS_DIR, c))) return c;
  }
  return null;
}

export function getAllTags(locale: Locale = DEFAULT_LOCALE): { tag: string; count: number }[] {
  const posts = getAllPosts(locale);
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (a.count === b.count ? a.tag.localeCompare(b.tag) : b.count - a.count));
}

/** Posts that share at least one tag with the source, excluding the source. */
export function getRelatedPosts(slug: string, locale: Locale = DEFAULT_LOCALE, limit = 3): PostMeta[] {
  const all = getAllPosts(locale);
  const source = all.find((p) => p.slug === slug);
  if (!source || source.tags.length === 0) return [];
  const overlapping = all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, overlap: p.tags.filter((t) => source.tags.includes(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => (a.overlap === b.overlap ? (a.p.date < b.p.date ? 1 : -1) : b.overlap - a.overlap));
  return overlapping.slice(0, limit).map((x) => x.p);
}

/** Newer / older neighbours in the chronological feed. */
export function getAdjacentPosts(slug: string, locale: Locale = DEFAULT_LOCALE): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const all = getAllPosts(locale);
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    next: idx > 0 ? all[idx - 1] : null,
    prev: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
