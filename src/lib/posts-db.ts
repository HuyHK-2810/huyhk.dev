import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type PostMeta,
  getAllPosts as getFilePosts,
  getAllTags as getFileTags,
} from "./posts";
import { getSupabaseRead, isSupabaseConfigured } from "./supabase";
import { computeReadingStats } from "./markdown";

export type DBPostRow = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string | null;
  body: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  date: string | null;
  word_count: number | null;
  reading_minutes: number | null;
  published_at: string | null;
};

export type DBPost = PostMeta & { body: string; id: string };

function rowToMeta(row: DBPostRow, availableLocales: Locale[]): DBPost {
  const stats =
    row.word_count && row.reading_minutes
      ? { wordCount: row.word_count, readingMinutes: row.reading_minutes }
      : computeReadingStats(row.body);
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    body: row.body,
    tags: row.tags ?? [],
    date: row.published_at ?? row.date ?? "",
    availableLocales,
    readingMinutes: stats.readingMinutes,
    wordCount: stats.wordCount,
  };
}

async function fetchAllPublishedRows(): Promise<DBPostRow[]> {
  const supa = getSupabaseRead();
  if (!supa) return [];
  const { data, error } = await supa
    .from("posts")
    .select(
      "id, slug, locale, title, excerpt, body, tags, status, date, word_count, reading_minutes, published_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    // Table missing, schema-cache miss, or any other read failure — fall back
    // to MDX silently. Logged in case it's a real outage rather than a
    // migration-in-progress state.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[posts-db] DB read failed, falling back to MDX:", error.message);
    }
    return [];
  }
  return (data as DBPostRow[]) ?? [];
}

function filePostsToDbShape(locale: Locale): DBPost[] {
  return getFilePosts(locale).map((p) => ({ ...p, id: p.slug, body: "" }));
}

/**
 * All published posts in the requested locale. Sources, in order:
 *   1. Supabase rows (status=published)
 *   2. MDX files in src/content/posts
 *
 * Sources are merged and de-duplicated by (slug, locale) — Supabase wins.
 * This means: during migration, file posts still show; once a slug is in DB,
 * the DB version replaces the file version automatically.
 */
export async function getAllPostsAsync(locale: Locale = DEFAULT_LOCALE): Promise<DBPost[]> {
  const dbRows = isSupabaseConfigured() ? await fetchAllPublishedRows() : [];

  // Group DB rows by slug to compute availableLocales correctly.
  const bySlug = new Map<string, Map<Locale, DBPostRow>>();
  for (const r of dbRows) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, new Map());
    bySlug.get(r.slug)!.set(r.locale, r);
  }

  const dbPosts: DBPost[] = [];
  const dbSlugLocaleKey = new Set<string>();
  for (const [slugKey, perLocale] of bySlug) {
    const available = Array.from(perLocale.keys());
    for (const localeKey of perLocale.keys()) {
      dbSlugLocaleKey.add(`${slugKey}::${localeKey}`);
    }
    const row = perLocale.get(locale) ?? perLocale.get(DEFAULT_LOCALE);
    if (row) dbPosts.push(rowToMeta(row, available));
  }

  const filePosts = filePostsToDbShape(locale).filter(
    (p) => !dbSlugLocaleKey.has(`${p.slug}::${p.locale}`),
  );

  const merged = [...dbPosts, ...filePosts];
  merged.sort((a, b) => (a.date < b.date ? 1 : -1));
  return merged;
}

export async function getPostAsync(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DBPost | null> {
  const all = await getAllPostsAsync(locale);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllSlugsAsync(): Promise<string[]> {
  // Union of DB slugs and file slugs (both locales).
  const slugs = new Set<string>();
  const [en, vi] = await Promise.all([
    getAllPostsAsync("en"),
    getAllPostsAsync("vi"),
  ]);
  for (const p of en) slugs.add(p.slug);
  for (const p of vi) slugs.add(p.slug);
  return Array.from(slugs);
}

export async function getAllTagsAsync(
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPostsAsync(locale);
  if (posts.length === 0) {
    return getFileTags(locale);
  }
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (a.count === b.count ? a.tag.localeCompare(b.tag) : b.count - a.count));
}

export async function getRelatedAsync(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
  limit = 3,
): Promise<DBPost[]> {
  const all = await getAllPostsAsync(locale);
  const source = all.find((p) => p.slug === slug);
  if (!source || source.tags.length === 0) return [];
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, overlap: p.tags.filter((t) => source.tags.includes(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) =>
      a.overlap === b.overlap ? (a.p.date < b.p.date ? 1 : -1) : b.overlap - a.overlap,
    )
    .slice(0, limit)
    .map((x) => x.p);
}

export async function getAdjacentAsync(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ prev: DBPost | null; next: DBPost | null }> {
  const all = await getAllPostsAsync(locale);
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    next: idx > 0 ? all[idx - 1] : null,
    prev: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export { LOCALES, DEFAULT_LOCALE };
export type { Locale, PostMeta };
