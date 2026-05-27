import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import {
  MARKET_CACHE_TAG,
  listAllProductsForAdmin,
} from "@/features/market/lib/queries";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"] as const);
const ALLOWED_TYPE = new Set(["digital", "physical", "service"] as const);

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
  const categoryId = url.searchParams.get("category_id");
  const rows = await listAllProductsForAdmin({
    status:
      status && ALLOWED_STATUS.has(status as never)
        ? (status as "draft" | "published" | "archived")
        : undefined,
    categoryId: categoryId ?? undefined,
  });
  return NextResponse.json({ products: rows });
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

  const title = (body.title as string ?? "").trim();
  if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 });

  const categoryId = body.category_id as string | undefined;
  if (!categoryId) return NextResponse.json({ error: "missing_category" }, { status: 400 });

  const description = (body.description as string ?? "").trim();
  if (!description) return NextResponse.json({ error: "missing_description" }, { status: 400 });

  const priceCents = Number(body.price_cents ?? 0);
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    return NextResponse.json({ error: "invalid_price" }, { status: 400 });
  }

  const status = (body.status as string ?? "draft").toLowerCase();
  if (!ALLOWED_STATUS.has(status as never)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const productType = (body.product_type as string ?? "digital").toLowerCase();
  if (!ALLOWED_TYPE.has(productType as never)) {
    return NextResponse.json({ error: "invalid_product_type" }, { status: 400 });
  }

  const slug = body.slug ? slugify(String(body.slug)) : slugify(title);
  if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });

  const insert: Record<string, unknown> = {
    slug,
    category_id: categoryId,
    title,
    subtitle: body.subtitle ?? null,
    short_description: body.short_description ?? null,
    description,
    cover_url: body.cover_url ?? null,
    gallery: body.gallery ?? [],
    price_cents: priceCents,
    compare_at_price_cents: body.compare_at_price_cents ?? null,
    currency: body.currency ?? "USD",
    product_type: productType,
    status,
    featured: Boolean(body.featured),
    tags: Array.isArray(body.tags) ? body.tags : [],
    metadata: body.metadata ?? {},
    stock_count: body.stock_count ?? 999,
    demo_url: body.demo_url ?? null,
    preview_files: body.preview_files ?? [],
    download_files: body.download_files ?? [],
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supa.from("market_products").insert(insert).select().single();
  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ product: data }, { status: 201 });
}
