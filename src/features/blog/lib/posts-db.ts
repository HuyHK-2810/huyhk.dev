import { unstable_cache } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { Post } from "@/lib/db/schema";
import {
  getSupabaseAdmin,
  getSupabaseRead,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { computeReadingStats } from "./markdown";

/** Cache tags used to invalidate the unstable_cache layer below. */
export const POSTS_CACHE_TAG = "posts";
export const POSTS_CACHE_REVALIDATE_SECONDS = 60;

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
  availableLocales: Locale[];
  readingMinutes: number;
  wordCount: number;
};

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

function dbRowFromDrizzle(row: Post): DBPostRow {
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
 * Fetch published posts. Drizzle (direct Postgres) is preferred; Supabase REST
 * is the fallback when DATABASE_URL is missing. Returns an empty array on any
 * error so callers degrade to empty rather than crashing.
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

/** Cached for 60s + tagged `posts`. Admin mutations call `revalidateTag`. */
const fetchAllPublishedRows = unstable_cache(
  fetchAllPublishedRowsUncached,
  ["posts:all-published"],
  { revalidate: POSTS_CACHE_REVALIDATE_SECONDS, tags: [POSTS_CACHE_TAG] },
);

export async function getAllPostsAsync(
  locale: Locale = DEFAULT_LOCALE,
): Promise<DBPost[]> {
  if (!isSupabaseConfigured()) return [];

  const rows = await fetchAllPublishedRows();

  // Group by slug so each post knows which locales are available.
  const bySlug = new Map<string, Map<Locale, DBPostRow>>();
  for (const r of rows) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, new Map());
    bySlug.get(r.slug)!.set(r.locale, r);
  }

  const posts: DBPost[] = [];
  for (const [, perLocale] of bySlug) {
    const available = Array.from(perLocale.keys());
    const row = perLocale.get(locale) ?? perLocale.get(DEFAULT_LOCALE);
    if (row) posts.push(rowToMeta(row, available));
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
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

/** Normalize Supabase REST snake_case → Drizzle camelCase. */
function normalizeSupabaseRow(r: Record<string, unknown>): Post {
  return {
    id: r.id as string,
    slug: r.slug as string,
    locale: r.locale as "en" | "vi",
    title: r.title as string,
    excerpt: (r.excerpt ?? null) as string | null,
    body: r.body as string,
    tags: (r.tags ?? []) as string[],
    status: r.status as "draft" | "published" | "archived",
    date: r.date ? new Date(r.date as string) : null,
    wordCount: (r.word_count ?? null) as number | null,
    readingMinutes: (r.reading_minutes ?? null) as number | null,
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
    publishedAt: r.published_at ? new Date(r.published_at as string) : null,
  };
}

/** Admin: list all posts (drafts included), Drizzle preferred, Supabase admin REST fallback. */
export async function listAllPostsForAdmin(opts?: {
  status?: "draft" | "published" | "archived";
  locale?: Locale;
}): Promise<Post[]> {
  const db = getDb();
  if (!db) {
    // Use ADMIN (service-role) client so drafts are visible — RLS bypassed.
    const supa = getSupabaseAdmin() ?? getSupabaseRead();
    if (!supa) return [];
    let q = supa.from("posts").select("*").order("updated_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    if (opts?.locale) q = q.eq("locale", opts.locale);
    const { data } = await q;
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeSupabaseRow);
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

/** Admin: fetch one post by id, Drizzle preferred, Supabase admin REST fallback. */
export async function getPostByIdForAdmin(id: string): Promise<Post | null> {
  const db = getDb();
  if (!db) {
    const supa = getSupabaseAdmin() ?? getSupabaseRead();
    if (!supa) return null;
    const { data, error } = await supa.from("posts").select("*").eq("id", id).single();
    if (error || !data) return null;
    return normalizeSupabaseRow(data as Record<string, unknown>);
  }
  const [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  return row ?? null;
}
