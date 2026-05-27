import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripeProvider } from "@/features/market/lib/payment/stripe";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { order_id?: string; reason?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.order_id) return NextResponse.json({ error: "missing_order" }, { status: 400 });

  // Verify ownership + paid + within 14 days + provider supports it
  const supa = await createSupabaseServerClient();
  const { data: order } = await supa
    .from("market_orders")
    .select("*")
    .eq("id", body.order_id)
    .eq("user_id", user.id)
    .single();
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status !== "paid") return NextResponse.json({ error: "not_refundable" }, { status: 409 });
  if (order.payment_provider !== "stripe") {
    return NextResponse.json({ error: "provider_unsupported_self_refund" }, { status: 400 });
  }
  if (
    !order.paid_at ||
    Date.now() > new Date(order.paid_at).getTime() + 14 * 24 * 3600 * 1000
  ) {
    return NextResponse.json({ error: "refund_window_expired" }, { status: 410 });
  }

  // Call Stripe refund via admin client (service-role for writes)
  const refundRes = await stripeProvider.refund({
    paymentIntentId: order.payment_intent_id,
    amountCents: undefined,   // full refund
  });
  if (!refundRes.ok) {
    return NextResponse.json({ error: refundRes.error }, { status: 502 });
  }

  // Insert refund row + update order
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("market_refunds").insert({
      order_id: order.id,
      amount_cents: order.total_cents,
      currency: order.currency,
      reason: body.reason ?? null,
      source: "self_service",
      status: "pending",          // webhook will flip to 'succeeded'
      provider_refund_id: refundRes.refundId,
      initiated_by: user.id,
    });
    await admin
      .from("market_orders")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  }

  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ ok: true, refund_id: refundRes.refundId });
}
