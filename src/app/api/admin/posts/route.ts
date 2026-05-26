import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/lib/admin-auth";
import { computeReadingStats } from "@/lib/markdown";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"] as const);
const ALLOWED_LOCALE = new Set(["en", "vi"] as const);

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
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const locale = url.searchParams.get("locale");

  let query = supa
    .from("posts")
    .select(
      "id, slug, locale, title, excerpt, tags, status, date, published_at, word_count, reading_minutes, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (status && ALLOWED_STATUS.has(status as never)) query = query.eq("status", status);
  if (locale && ALLOWED_LOCALE.has(locale as never)) query = query.eq("locale", locale);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
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
    status === "published"
      ? body.published_at ?? new Date().toISOString()
      : null;

  const { data, error } = await supa
    .from("posts")
    .insert({
      slug,
      locale,
      title,
      excerpt: body.excerpt ?? null,
      body: markdown,
      tags,
      status,
      date,
      word_count: stats.wordCount,
      reading_minutes: stats.readingMinutes,
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message, code: error.code }, { status: code });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
