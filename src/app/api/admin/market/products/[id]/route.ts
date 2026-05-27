import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import {
  MARKET_CACHE_TAG,
  getProductByIdForAdmin,
} from "@/features/market/lib/queries";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"] as const);
const ALLOWED_TYPE = new Set(["digital", "physical", "service"] as const);

const CAMEL_TO_SNAKE: Record<string, string> = {
  categoryId: "category_id",
  shortDescription: "short_description",
  coverUrl: "cover_url",
  priceCents: "price_cents",
  compareAtPriceCents: "compare_at_price_cents",
  productType: "product_type",
  stockCount: "stock_count",
  demoUrl: "demo_url",
  previewFiles: "preview_files",
  downloadFiles: "download_files",
  publishedAt: "published_at",
};

type Params = { id: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await getProductByIdForAdmin(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ product: row });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Accept either camelCase or snake_case; normalize to snake for Supabase.
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    const key = CAMEL_TO_SNAKE[k] ?? k;
    update[key] = v;
  }

  if (typeof update.status === "string") {
    if (!ALLOWED_STATUS.has(update.status as never)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    if (update.status === "published" && !update.published_at) {
      update.published_at = new Date().toISOString();
    } else if (update.status === "draft") {
      update.published_at = null;
    }
  }
  if (typeof update.product_type === "string") {
    if (!ALLOWED_TYPE.has(update.product_type as never)) {
      return NextResponse.json({ error: "invalid_product_type" }, { status: 400 });
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const { data, error } = await supa
    .from("market_products")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ product: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  const { error } = await supa.from("market_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ ok: true });
}
