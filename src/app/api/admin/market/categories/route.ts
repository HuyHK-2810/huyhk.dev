import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import {
  MARKET_CACHE_TAG,
  listAllCategoriesForAdmin,
} from "@/features/market/lib/queries";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

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
  const rows = await listAllCategoriesForAdmin();
  return NextResponse.json({ categories: rows });
}

export async function POST(req: Request) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const name = (body.name as string ?? "").trim();
  if (!name) return NextResponse.json({ error: "missing_name" }, { status: 400 });

  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });

  const { data, error } = await supa
    .from("market_categories")
    .insert({
      slug,
      name,
      description: body.description ?? null,
      icon: body.icon ?? null,
      accent_color: body.accent_color ?? null,
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();
  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ category: data }, { status: 201 });
}
