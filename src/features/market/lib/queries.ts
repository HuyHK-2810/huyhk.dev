/**
 * Market data layer — Drizzle preferred, Supabase REST fallback (same pattern
 * as blog/posts-db). Cached via unstable_cache + tagged 'market' for
 * revalidation on admin mutations.
 */

import { unstable_cache } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, marketSchema } from "@/lib/db";
import {
  getSupabaseAdmin,
  getSupabaseRead,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type {
  MarketCategory,
  MarketProduct,
  ProductFile,
} from "@/lib/db/market";

export const MARKET_CACHE_TAG = "market";
export const MARKET_CACHE_REVALIDATE_SECONDS = 60;

// ─────────────────────────────────────────────────────────────────
// Normalizers (Supabase REST → Drizzle camelCase)
// ─────────────────────────────────────────────────────────────────

function normalizeCategory(r: Record<string, unknown>): MarketCategory {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    description: (r.description ?? null) as string | null,
    icon: (r.icon ?? null) as string | null,
    accentColor: (r.accent_color ?? null) as string | null,
    sortOrder: r.sort_order as number,
    isActive: r.is_active as boolean,
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

function normalizeProduct(r: Record<string, unknown>): MarketProduct {
  return {
    id: r.id as string,
    slug: r.slug as string,
    categoryId: r.category_id as string,
    title: r.title as string,
    subtitle: (r.subtitle ?? null) as string | null,
    shortDescription: (r.short_description ?? null) as string | null,
    description: r.description as string,
    coverUrl: (r.cover_url ?? null) as string | null,
    gallery: (r.gallery ?? []) as string[],
    priceCents: r.price_cents as number,
    compareAtPriceCents: (r.compare_at_price_cents ?? null) as number | null,
    currency: r.currency as string,
    productType: r.product_type as "digital" | "physical" | "service",
    downloadUrl: (r.download_url ?? null) as string | null,
    licenseTemplate: (r.license_template ?? null) as string | null,
    status: r.status as "draft" | "published" | "archived",
    featured: r.featured as boolean,
    tags: (r.tags ?? []) as string[],
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    stockCount: r.stock_count as number,
    demoUrl: (r.demo_url ?? null) as string | null,
    previewFiles: (r.preview_files ?? []) as ProductFile[],
    downloadFiles: (r.download_files ?? []) as ProductFile[],
    stripeProductId: (r.stripe_product_id ?? null) as string | null,
    stripePriceId: (r.stripe_price_id ?? null) as string | null,
    viewCount: r.view_count as number,
    purchaseCount: r.purchase_count as number,
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
    publishedAt: r.published_at ? new Date(r.published_at as string) : null,
  };
}

// ─────────────────────────────────────────────────────────────────
// Public reads (cached + tagged)
// ─────────────────────────────────────────────────────────────────

async function fetchActiveCategoriesUncached(): Promise<MarketCategory[]> {
  const db = getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(marketSchema.marketCategories)
        .where(eq(marketSchema.marketCategories.isActive, true))
        .orderBy(marketSchema.marketCategories.sortOrder);
    } catch {
      /* fall through */
    }
  }
  const supa = getSupabaseRead();
  if (!supa) return [];
  const { data } = await supa
    .from("market_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeCategory);
}

export const getActiveCategories = unstable_cache(
  fetchActiveCategoriesUncached,
  ["market:categories:active"],
  { revalidate: MARKET_CACHE_REVALIDATE_SECONDS, tags: [MARKET_CACHE_TAG] },
);

async function fetchPublishedProductsUncached(
  categorySlug?: string,
): Promise<MarketProduct[]> {
  const db = getDb();
  if (db) {
    try {
      const baseQuery = db
        .select({
          product: marketSchema.marketProducts,
        })
        .from(marketSchema.marketProducts)
        .innerJoin(
          marketSchema.marketCategories,
          eq(marketSchema.marketProducts.categoryId, marketSchema.marketCategories.id),
        )
        .where(
          categorySlug
            ? and(
                eq(marketSchema.marketProducts.status, "published"),
                eq(marketSchema.marketCategories.slug, categorySlug),
              )
            : eq(marketSchema.marketProducts.status, "published"),
        )
        .orderBy(desc(marketSchema.marketProducts.publishedAt));
      const rows = await baseQuery;
      return rows.map((r) => r.product);
    } catch {
      /* fall through */
    }
  }

  const supa = getSupabaseRead();
  if (!supa) return [];
  let q = supa
    .from("market_products")
    .select("*, market_categories!inner(slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (categorySlug) {
    q = q.eq("market_categories.slug", categorySlug);
  }
  const { data } = await q;
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeProduct);
}

export async function getPublishedProducts(
  categorySlug?: string,
): Promise<MarketProduct[]> {
  const cached = unstable_cache(
    () => fetchPublishedProductsUncached(categorySlug),
    ["market:products:published", categorySlug ?? "all"],
    { revalidate: MARKET_CACHE_REVALIDATE_SECONDS, tags: [MARKET_CACHE_TAG] },
  );
  return cached();
}

export async function getProductBySlug(
  categorySlug: string,
  productSlug: string,
): Promise<{ product: MarketProduct; category: MarketCategory } | null> {
  const products = await getPublishedProducts(categorySlug);
  const product = products.find((p) => p.slug === productSlug);
  if (!product) return null;
  const categories = await getActiveCategories();
  const category = categories.find((c) => c.id === product.categoryId);
  if (!category) return null;
  return { product, category };
}

export async function getFeaturedProducts(limit = 4): Promise<MarketProduct[]> {
  const all = await getPublishedProducts();
  return all.filter((p) => p.featured).slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────
// Admin reads (drafts + archived, no caching)
// ─────────────────────────────────────────────────────────────────

export async function listAllProductsForAdmin(opts?: {
  status?: "draft" | "published" | "archived";
  categoryId?: string;
}): Promise<MarketProduct[]> {
  const db = getDb();
  if (!db) {
    const supa = getSupabaseAdmin() ?? getSupabaseRead();
    if (!supa) return [];
    let q = supa.from("market_products").select("*").order("updated_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
    const { data } = await q;
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeProduct);
  }
  const conditions = [
    opts?.status ? eq(marketSchema.marketProducts.status, opts.status) : undefined,
    opts?.categoryId ? eq(marketSchema.marketProducts.categoryId, opts.categoryId) : undefined,
  ].filter((c) => c !== undefined);
  return await db
    .select()
    .from(marketSchema.marketProducts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(marketSchema.marketProducts.updatedAt));
}

export async function getProductByIdForAdmin(id: string): Promise<MarketProduct | null> {
  const db = getDb();
  if (!db) {
    const supa = getSupabaseAdmin() ?? getSupabaseRead();
    if (!supa) return null;
    const { data, error } = await supa.from("market_products").select("*").eq("id", id).single();
    if (error || !data) return null;
    return normalizeProduct(data as Record<string, unknown>);
  }
  const [row] = await db
    .select()
    .from(marketSchema.marketProducts)
    .where(eq(marketSchema.marketProducts.id, id));
  return row ?? null;
}

export async function listAllCategoriesForAdmin(): Promise<MarketCategory[]> {
  const db = getDb();
  if (!db) {
    const supa = getSupabaseAdmin() ?? getSupabaseRead();
    if (!supa) return [];
    const { data } = await supa.from("market_categories").select("*").order("sort_order");
    return ((data ?? []) as Record<string, unknown>[]).map(normalizeCategory);
  }
  return await db
    .select()
    .from(marketSchema.marketCategories)
    .orderBy(marketSchema.marketCategories.sortOrder);
}

// ─────────────────────────────────────────────────────────────────
// FX rates (display-time conversion)
// ─────────────────────────────────────────────────────────────────

export type FxRate = { quote: string; rate: number };

async function fetchFxRatesUncached(): Promise<FxRate[]> {
  const supa = getSupabaseRead();
  if (!supa) return [{ quote: "USD", rate: 1 }];
  const { data } = await supa
    .from("market_fx_rates")
    .select("quote_currency, rate")
    .eq("base_currency", "USD");
  return ((data ?? []) as Array<{ quote_currency: string; rate: string }>).map(
    (r) => ({ quote: r.quote_currency, rate: Number(r.rate) }),
  );
}

export const getFxRates = unstable_cache(
  fetchFxRatesUncached,
  ["market:fx:usd-base"],
  { revalidate: 3600, tags: ["market-fx"] }, // 1h — fx rates change slowly
);

/**
 * Convert price (in cents, base currency USD) to the requested display
 * currency. Returns the converted MAJOR-unit amount + a formatter string.
 */
export function convertPrice(
  priceCents: number,
  baseCurrency: string,
  displayCurrency: string,
  fxRates: FxRate[],
): { amount: number; currency: string; formatted: string } {
  if (baseCurrency !== "USD") {
    // Schema assumes base is USD. If someone stored a product in non-USD,
    // surface that without conversion to avoid showing wrong amounts.
    const amount = priceCents / 100;
    return { amount, currency: baseCurrency, formatted: formatMoney(amount, baseCurrency) };
  }
  const fx = fxRates.find((r) => r.quote === displayCurrency);
  const rate = fx?.rate ?? 1;
  const amount = (priceCents / 100) * rate;
  return { amount, currency: displayCurrency, formatted: formatMoney(amount, displayCurrency) };
}

export function formatMoney(amount: number, currency: string): string {
  // VND has no decimal places and uses 'đ' suffix conventionally
  if (currency === "VND") {
    return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

// Sentinel to satisfy unused-import lint in environments where sql tag isn't used yet.
void sql;
