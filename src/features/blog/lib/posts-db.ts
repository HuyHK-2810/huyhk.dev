import { unstable_cache } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSupabaseRead, isSupabaseConfigured } from "@/lib/supabase";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type PostMeta,
  getAllPosts as getFilePosts,
  getAllTags as getFileTags,
} from "./posts";
import { computeReadingStats } from "./markdown";

/** Cache tags used to invalidate the unstable_cache layer below. */
export const POSTS_CACHE_TAG = "posts";
export const POSTS_CACHE_REVALIDATE_SECONDS = 60;

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

function dbRowFromDrizzle(row: schema.Post): DBPostRow {
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    tags: row.tags,
    status: row.status,
    date: row.date ? row.date.toISOString() : null,
    word_count: row.wordCount,
    reading_minutes: row.readingMinutes,
    published_at: row.publishedAt ? row.publishedAt.toISOString() : null,
  };
}

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

/**
 * Fetch all published posts. Drizzle first (when DATABASE_URL is set),
 * Supabase REST as fallback. Empty array on any error → caller falls back
 * to MDX files.
 */
async function fetchAllPublishedRowsUncached(): Promise<DBPostRow[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.status, "published"))
        .orderBy(desc(schema.posts.publishedAt));
      return rows.map(dbRowFromDrizzle);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[posts-db] Drizzle read failed, trying Supabase REST:", err);
      }
    }
  }

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
    if (process.env.NODE_ENV !== "production") {
      console.warn("[posts-db] Supabase REST read failed:", error.message);
    }
    return [];
  }
  return (data as DBPostRow[]) ?? [];
}

/**
 * Cached for 60s + tagged `posts`. Admin mutations call
 * `revalidateTag('posts')` to invalidate. The cache lives across requests on
 * the same server instance, so a hot page costs zero DB roundtrips after the
 * first hit.
 */
const fetchAllPublishedRows = unstable_cache(
  fetchAllPublishedRowsUncached,
  ["posts:all-published"],
  { revalidate: POSTS_CACHE_REVALIDATE_SECONDS, tags: [POSTS_CACHE_TAG] },
);

function filePostsToDbShape(locale: Locale): DBPost[] {
  return getFilePosts(locale).map((p) => ({ ...p, id: p.slug, body: "" }));
}

export async function getAllPostsAsync(locale: Locale = DEFAULT_LOCALE): Promise<DBPost[]> {
  const dbRows = isSupabaseConfigured() ? await fetchAllPublishedRows() : [];

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
  if (posts.length === 0) return getFileTags(locale);
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

/** Admin: list all posts (drafts included), Drizzle preferred. */
export async function listAllPostsForAdmin(opts?: {
  status?: "draft" | "published" | "archived";
  locale?: Locale;
}): Promise<schema.Post[]> {
  const db = getDb();
  if (!db) {
    const supa = getSupabaseRead();
    if (!supa) return [];
    let q = supa.from("posts").select("*").order("updated_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    if (opts?.locale) q = q.eq("locale", opts.locale);
    const { data } = await q;
    return ((data ?? []) as unknown) as schema.Post[];
  }
  const conditions = [
    opts?.status ? eq(schema.posts.status, opts.status) : undefined,
    opts?.locale ? eq(schema.posts.locale, opts.locale) : undefined,
  ].filter((c) => c !== undefined);
  return await db
    .select()
    .from(schema.posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.posts.updatedAt));
}

export { LOCALES, DEFAULT_LOCALE };
export type { Locale, PostMeta };
