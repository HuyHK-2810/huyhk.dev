import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getProvider, type PaymentProviderId } from "@/features/market/lib/payment";
import { getFxRates } from "@/features/market/lib/queries";

export const runtime = "nodejs";

type Item = {
  productId: string;
  slug: string;
  categorySlug: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
};

type Body = {
  items: Item[];
  email: string;
  provider: PaymentProviderId;
  discountCode?: string | null;
  displayCurrency?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.items?.length) return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? "")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const provider = getProvider(body.provider);
  if (!provider || !provider.isConfigured()) {
    return NextResponse.json({ error: "provider_unavailable" }, { status: 400 });
  }

  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  // ──────────────────────────────────────────────────────────────
  // Re-validate each item against current DB state — never trust client price/stock.
  // ──────────────────────────────────────────────────────────────
  const ids = body.items.map((i) => i.productId);
  const { data: products, error: pErr } = await supa
    .from("market_products")
    .select("id, slug, title, price_cents, currency, status, stock_count, market_categories(slug)")
    .in("id", ids);
  if (pErr) return NextResponse.json({ error: "db_read_failed" }, { status: 500 });

  const productMap = new Map(
    (products ?? []).map((p) => [p.id as string, p as Record<string, unknown>]),
  );

  const validatedLines: Array<Item & { categorySlug: string }> = [];
  for (const it of body.items) {
    const prod = productMap.get(it.productId);
    if (!prod) return NextResponse.json({ error: `product_missing_${it.productId}` }, { status: 400 });
    if (prod.status !== "published") {
      return NextResponse.json({ error: `product_unavailable_${it.productId}` }, { status: 400 });
    }
    if ((prod.stock_count as number) < it.quantity) {
      return NextResponse.json({ error: `out_of_stock_${it.productId}` }, { status: 409 });
    }
    const catSlug =
      (prod.market_categories as { slug: string } | { slug: string }[] | null)?.constructor === Array
        ? ((prod.market_categories as { slug: string }[])[0]?.slug ?? "")
        : ((prod.market_categories as { slug: string } | null)?.slug ?? "");
    validatedLines.push({
      productId: it.productId,
      slug: prod.slug as string,
      categorySlug: catSlug || it.categorySlug,
      title: prod.title as string,
      unitPriceCents: prod.price_cents as number,   // server price wins
      quantity: it.quantity,
    });
  }

  // Subtotal in USD cents
  const subtotalCents = validatedLines.reduce(
    (s, l) => s + l.unitPriceCents * l.quantity,
    0,
  );

  // ──────────────────────────────────────────────────────────────
  // Discount
  // ──────────────────────────────────────────────────────────────
  let discountCents = 0;
  let discountRow: Record<string, unknown> | null = null;
  if (body.discountCode) {
    const { data: dc } = await supa
      .from("market_discount_codes")
      .select("*")
      .eq("code", body.discountCode.toUpperCase())
      .eq("is_active", true)
      .single();
    if (dc) {
      const t = (dc as Record<string, unknown>).type as string;
      const amt = (dc as Record<string, unknown>).amount as number;
      if (t === "percent") discountCents = Math.floor((subtotalCents * amt) / 100);
      else if (t === "flat") discountCents = Math.min(amt, subtotalCents);
      discountRow = dc;
    }
  }
  const totalCents = Math.max(0, subtotalCents - discountCents);

  // Display rate
  const fxRates = await getFxRates();
  const displayCurrency = (body.displayCurrency ?? "USD").toUpperCase();
  const displayRate = fxRates.find((r) => r.quote === displayCurrency)?.rate ?? 1;

  // Affiliate (from cookie)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const refMatch = cookieHeader.match(/hk_ref=([a-zA-Z0-9_-]+)/);
  const affiliateSlug = refMatch?.[1] ?? null;

  // ──────────────────────────────────────────────────────────────
  // Create pending order row + line items
  // ──────────────────────────────────────────────────────────────
  const { data: order, error: oErr } = await supa
    .from("market_orders")
    .insert({
      email: body.email.trim().toLowerCase(),
      status: "pending",
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      total_cents: totalCents,
      currency: "USD",
      display_currency: displayCurrency,
      display_rate: displayRate,
      payment_provider: provider.id,
      discount_code: discountRow ? (discountRow.code as string) : null,
      affiliate_slug: affiliateSlug,
    })
    .select()
    .single();
  if (oErr || !order) {
    return NextResponse.json(
      { error: "order_create_failed", detail: oErr?.message ?? null },
      { status: 500 },
    );
  }

  const itemsPayload = validatedLines.map((l) => ({
    order_id: order.id as string,
    product_id: l.productId,
    product_title: l.title,
    product_slug: l.slug,
    category_slug: l.categorySlug,
    unit_price_cents: l.unitPriceCents,
    quantity: l.quantity,
  }));
  await supa.from("market_order_items").insert(itemsPayload);

  // ──────────────────────────────────────────────────────────────
  // Hand off to provider
  // ──────────────────────────────────────────────────────────────
  const origin = req.headers.get("origin") ?? `https://${req.headers.get("host")}`;
  const result = await provider.createCheckoutSession({
    orderId: order.id as string,
    lines: validatedLines.map((l) => ({
      productId: l.productId,
      productSlug: l.slug,
      categorySlug: l.categorySlug,
      title: l.title,
      unitPriceCents: l.unitPriceCents,
      quantity: l.quantity,
    })),
    subtotalCents,
    discountCents,
    totalCents,
    baseCurrency: "USD",
    email: body.email.trim().toLowerCase(),
    discountCode: body.discountCode ?? null,
    affiliateSlug,
    successUrl: `${origin}/checkout/success`,
    cancelUrl: `${origin}/cart`,
    displayCurrency,
    displayRate,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: 502 });
  }

  // Save provider session id on the order
  await supa
    .from("market_orders")
    .update({ payment_session_id: result.sessionId })
    .eq("id", order.id);

  return NextResponse.json({ redirectUrl: result.redirectUrl, orderId: order.id });
}
