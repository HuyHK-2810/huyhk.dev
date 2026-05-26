import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDb, schema, isDbConfigured } from "@/lib/db";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import { computeReadingStats } from "@/features/blog/lib/markdown";
import {
  listAllPostsForAdmin,
  POSTS_CACHE_TAG,
} from "@/features/blog/lib/posts-db";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"] as const);
const ALLOWED_LOCALE = new Set(["en", "vi"] as const);

/**
 * Whitelist for `?fields=` sparse-fieldset projection. API uses snake_case;
 * Drizzle rows are camelCase, so we keep both names mapped.
 *
 * Body is intentionally excluded — it's heavy and the lightweight list
 * endpoint shouldn't ship full post content. Use GET /api/admin/posts/[id]
 * for the full row.
 */
const FIELD_MAP: Record<string, keyof typeof schema.posts.$inferSelect> = {
  id: "id",
  slug: "slug",
  locale: "locale",
  title: "title",
  excerpt: "excerpt",
  tags: "tags",
  status: "status",
  date: "date",
  word_count: "wordCount",
  reading_minutes: "readingMinutes",
  published_at: "publishedAt",
  updated_at: "updatedAt",
  created_at: "createdAt",
};
const ALLOWED_FIELDS = new Set(Object.keys(FIELD_MAP));

type CreateBody = {
  slug?: string;
  locale?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  tags?: string[];
  status?: string;
  date?: string;
  published_at?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: Request) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const locale = url.searchParams.get("locale");
  const fieldsParam = url.searchParams.get("fields");

  // Parse + validate `fields` if present.
  let projection: string[] | null = null;
  if (fieldsParam) {
    const requested = fieldsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const invalid = requested.filter((f) => !ALLOWED_FIELDS.has(f));
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: "invalid_fields",
          invalid,
          allowed: Array.from(ALLOWED_FIELDS).sort(),
        },
        { status: 400 },
      );
    }
    if (requested.length === 0) {
      return NextResponse.json({ error: "empty_fields" }, { status: 400 });
    }
    projection = requested;
  }

  const rows = await listAllPostsForAdmin({
    status:
      status && ALLOWED_STATUS.has(status as never)
        ? (status as "draft" | "published" | "archived")
        : undefined,
    locale:
      locale && ALLOWED_LOCALE.has(locale as never)
        ? (locale as "en" | "vi")
        : undefined,
  });

  if (!projection) {
    return NextResponse.json({ posts: rows });
  }

  // Project columns down to the requested fields, preserving the snake_case
  // names the API uses (callers asked for those names, return them as-is).
  const projected = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const apiField of projection!) {
      const dbField = FIELD_MAP[apiField];
      out[apiField] = row[dbField];
    }
    return out;
  });

  return NextResponse.json({ posts: projected, count: projected.length });
}

export async function POST(req: Request) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 });

  const markdown = (body.body ?? "").trim();
  if (!markdown) return NextResponse.json({ error: "missing_body" }, { status: 400 });

  const locale = (body.locale ?? "en").toLowerCase();
  if (!ALLOWED_LOCALE.has(locale as never)) {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }

  const status = (body.status ?? "draft").toLowerCase();
  if (!ALLOWED_STATUS.has(status as never)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const slug = body.slug ? slugify(body.slug) : slugify(title);
  if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });

  const stats = computeReadingStats(markdown);
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const date = body.date ?? new Date().toISOString();
  const publishedAt =
    status === "published" ? body.published_at ?? new Date().toISOString() : null;

  try {
    const [inserted] = await db
      .insert(schema.posts)
      .values({
        slug,
        locale: locale as "en" | "vi",
        title,
        excerpt: body.excerpt ?? null,
        body: markdown,
        tags,
        status: status as "draft" | "published" | "archived",
        date: new Date(date),
        wordCount: stats.wordCount,
        readingMinutes: stats.readingMinutes,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      })
      .returning();

    revalidateTag(POSTS_CACHE_TAG);
    return NextResponse.json({ post: inserted }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "insert_failed";
    const code = message.includes("duplicate") || message.includes("23505") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: code });
  }
}
