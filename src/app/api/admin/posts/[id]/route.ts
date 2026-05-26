import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import { computeReadingStats } from "@/features/blog/lib/markdown";
import {
  POSTS_CACHE_TAG,
  getPostByIdForAdmin,
} from "@/features/blog/lib/posts-db";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"] as const);
const ALLOWED_LOCALE = new Set(["en", "vi"] as const);

type Params = { id: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await getPostByIdForAdmin(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ post: row });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Build the update payload in Drizzle camelCase shape first.
  const update: Partial<typeof schema.posts.$inferInsert> = {};

  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.slug === "string") update.slug = String(body.slug).trim();
  if (typeof body.excerpt === "string" || body.excerpt === null) {
    update.excerpt = body.excerpt as string | null;
  }
  if (typeof body.body === "string") {
    update.body = body.body;
    const stats = computeReadingStats(body.body);
    update.wordCount = stats.wordCount;
    update.readingMinutes = stats.readingMinutes;
  }
  if (Array.isArray(body.tags)) update.tags = (body.tags as unknown[]).map(String);
  if (typeof body.date === "string") update.date = new Date(body.date);

  if (typeof body.locale === "string") {
    if (!ALLOWED_LOCALE.has(body.locale as never)) {
      return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
    }
    update.locale = body.locale as "en" | "vi";
  }

  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.has(body.status as never)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    update.status = body.status as "draft" | "published" | "archived";
    if (body.status === "published") {
      update.publishedAt = body.published_at
        ? new Date(body.published_at as string)
        : new Date();
    } else if (body.status === "draft") {
      update.publishedAt = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  // Drizzle path
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .update(schema.posts)
        .set(update)
        .where(eq(schema.posts.id, id))
        .returning();
      if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
      revalidateTag(POSTS_CACHE_TAG);
      return NextResponse.json({ post: row });
    } catch (err) {
      const message = err instanceof Error ? err.message : "update_failed";
      const code = message.includes("duplicate") || message.includes("23505") ? 409 : 500;
      return NextResponse.json({ error: message }, { status: code });
    }
  }

  // Supabase REST fallback (admin/service-role to bypass RLS).
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  // Translate camelCase → snake_case for Supabase REST.
  const supaUpdate: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(update)) {
    const key = k
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase();
    supaUpdate[key] = v instanceof Date ? v.toISOString() : v;
  }
  const { data, error } = await supa
    .from("posts")
    .update(supaUpdate)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  revalidateTag(POSTS_CACHE_TAG);
  return NextResponse.json({ post: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const db = getDb();
  if (db) {
    await db.delete(schema.posts).where(eq(schema.posts.id, id));
    revalidateTag(POSTS_CACHE_TAG);
    return NextResponse.json({ ok: true });
  }

  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const { error } = await supa.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(POSTS_CACHE_TAG);
  return NextResponse.json({ ok: true });
}
