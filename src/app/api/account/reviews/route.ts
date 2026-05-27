import { NextResponse } from "next/server";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    product_id?: string;
    order_item_id?: string;
    rating?: number;
    title?: string | null;
    body?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.product_id || !body.order_item_id) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const rating = Number(body.rating ?? 0);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  }

  // RLS enforces user_id = auth.uid() on insert, but we double-check the
  // order_item is for a paid order this user owns.
  const supa = await createSupabaseServerClient();
  const { data: item } = await supa
    .from("market_order_items")
    .select("id, product_id, market_orders!inner(status, user_id, paid_at)")
    .eq("id", body.order_item_id)
    .single();

  type Joined = {
    id: string;
    product_id: string;
    market_orders: { status: string; user_id: string; paid_at: string | null };
  };
  const it = item as unknown as Joined | null;
  if (!it) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (it.product_id !== body.product_id) {
    return NextResponse.json({ error: "product_mismatch" }, { status: 400 });
  }
  if (it.market_orders.user_id !== user.id || it.market_orders.status !== "paid") {
    return NextResponse.json({ error: "not_eligible" }, { status: 403 });
  }
  // Review must be within 14 days of paid_at (per AI_PUBLISHING blog rules,
  // editorial decision: only review while memory is fresh)
  if (
    !it.market_orders.paid_at ||
    Date.now() > new Date(it.market_orders.paid_at).getTime() + 14 * 24 * 3600 * 1000
  ) {
    return NextResponse.json({ error: "window_expired" }, { status: 410 });
  }

  const { data, error } = await supa
    .from("market_product_reviews")
    .insert({
      product_id: body.product_id,
      user_id: user.id,
      order_item_id: body.order_item_id,
      rating,
      title: body.title ?? null,
      body: body.body ?? null,
      status: "pending",
    })
    .select()
    .single();
  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  return NextResponse.json({ review: data }, { status: 201 });
}
