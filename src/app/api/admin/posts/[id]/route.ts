import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import { computeReadingStats } from "@/features/blog/lib/markdown";

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
  const db = getDb();
  if (!db) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  const { id } = await params;
  const [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
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
  const db = getDb();
  if (!db) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

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

  try {
    const [row] = await db
      .update(schema.posts)
      .set(update)
      .where(eq(schema.posts.id, id))
      .returning();
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ post: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "update_failed";
    const code = message.includes("duplicate") || message.includes("23505") ? 409 : 500;
    return NextResponse.json({ error: message }, { status: code });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  const { id } = await params;
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  return NextResponse.json({ ok: true });
}
