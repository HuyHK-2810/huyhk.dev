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

type Params = { id: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;
  const { data, error } = await supa.from("posts").select("*").eq("id", id).single();
  if (error) {
    const code = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  return NextResponse.json({ post: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.slug === "string") update.slug = String(body.slug).trim();
  if (typeof body.excerpt === "string" || body.excerpt === null) update.excerpt = body.excerpt;
  if (typeof body.body === "string") {
    update.body = body.body;
    const stats = computeReadingStats(body.body);
    update.word_count = stats.wordCount;
    update.reading_minutes = stats.readingMinutes;
  }
  if (Array.isArray(body.tags)) update.tags = (body.tags as unknown[]).map(String);
  if (typeof body.date === "string") update.date = body.date;

  if (typeof body.locale === "string") {
    if (!ALLOWED_LOCALE.has(body.locale as never)) {
      return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
    }
    update.locale = body.locale;
  }

  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.has(body.status as never)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    update.status = body.status;
    if (body.status === "published") {
      update.published_at = body.published_at ?? new Date().toISOString();
    } else if (body.status === "draft") {
      update.published_at = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const { data, error } = await supa
    .from("posts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;
  const { error } = await supa.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
