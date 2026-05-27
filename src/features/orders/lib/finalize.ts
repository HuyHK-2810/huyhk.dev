/**
 * Order finalize — called from webhook handlers when a payment succeeds.
 *
 * Responsibilities:
 *   1. Mark the order paid + record provider IDs
 *   2. Decrement stock for each line item (via SQL RPC `market_decrement_stock`)
 *   3. Bump purchase_count + uses_count on related rows
 *   4. Auto-create user if buyer's email isn't in auth.users
 *   5. Send magic-link login email so the buyer can access /account/orders
 *   6. Send a receipt + download instruction email
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM ?? "huyHK <hi@huyhk.dev>";

export async function finalizeSucceededOrder(opts: {
  orderId: string;
  paymentIntentId: string;
  provider: "stripe" | "vnpay" | "momo" | "wise";
  email?: string;
}): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) throw new Error("supabase_admin_unavailable");

  // 1) Fetch the order + items
  const { data: order } = await supa
    .from("market_orders")
    .select("*")
    .eq("id", opts.orderId)
    .single();
  if (!order) {
    console.warn("[finalize] order not found:", opts.orderId);
    return;
  }
  if (order.status === "paid") {
    return; // idempotent
  }

  const buyerEmail = (opts.email ?? order.email).toLowerCase();

  // 2) Auto-create user if needed + capture user_id
  let userId: string | null = order.user_id;
  if (!userId) {
    userId = await ensureUserForEmail(buyerEmail);
  }

  // 3) Mark order paid
  await supa
    .from("market_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_intent_id: opts.paymentIntentId,
      user_id: userId,
    })
    .eq("id", opts.orderId);

  // 4) Decrement stock + bump purchase counters for each item
  const { data: items } = await supa
    .from("market_order_items")
    .select("product_id, quantity")
    .eq("order_id", opts.orderId);
  for (const it of items ?? []) {
    await supa.rpc("market_decrement_stock", {
      p_product_id: it.product_id,
      p_qty: it.quantity,
    });
  }

  // 5) If a discount code was applied, bump its uses
  if (order.discount_code) {
    const { data: dc } = await supa
      .from("market_discount_codes")
      .select("id")
      .eq("code", order.discount_code)
      .single();
    if (dc) {
      await supa.from("market_discount_uses").insert({
        discount_id: dc.id,
        order_id: opts.orderId,
        user_id: userId,
        applied_cents: order.discount_cents ?? 0,
      });
      await supa.rpc("increment_discount_uses", { p_discount_id: dc.id }).then(
        () => null,
        // ignore — function might not exist yet; fall back to manual update.
        async () => {
          await supa
            .from("market_discount_codes")
            .update({ uses_count: 1 })
            .eq("id", dc.id);
        },
      );
    }
  }

  // 6) Affiliate attribution: bump affiliate earnings if cookie referrer is registered
  if (order.affiliate_slug) {
    const { data: aff } = await supa
      .from("market_affiliates")
      .select("id, commission_pct, total_earned_cents")
      .eq("slug", order.affiliate_slug)
      .single();
    if (aff) {
      const commission = Math.floor(
        (order.total_cents * Number(aff.commission_pct)) / 100,
      );
      await supa
        .from("market_affiliates")
        .update({ total_earned_cents: (aff.total_earned_cents ?? 0) + commission })
        .eq("id", aff.id);
    }
  }

  // 7) Send email: magic link + order receipt with download links
  await sendOrderEmail({
    orderId: opts.orderId,
    email: buyerEmail,
  });
}

export async function recordFailedOrder(opts: {
  orderId: string;
  reason: string;
}): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;
  await supa
    .from("market_orders")
    .update({
      status: "failed",
      metadata: { failure_reason: opts.reason },
    })
    .eq("id", opts.orderId);
}

export async function recordRefund(opts: {
  orderId: string;
  refundId: string;
  amountCents: number;
}): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;
  await supa.from("market_refunds").insert({
    order_id: opts.orderId,
    amount_cents: opts.amountCents,
    currency: "USD",
    source: "admin",
    status: "succeeded",
    provider_refund_id: opts.refundId,
    completed_at: new Date().toISOString(),
  });
  await supa
    .from("market_orders")
    .update({ status: "refunded", refunded_at: new Date().toISOString() })
    .eq("id", opts.orderId);
}

// ─────────────────────────────────────────────────────────────────
// User auto-create via Supabase admin
// ─────────────────────────────────────────────────────────────────

async function ensureUserForEmail(email: string): Promise<string | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;

  // 1. Look up existing profile by email
  const { data: existing } = await supa
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return existing.id as string;

  // 2. Try to find the auth.users row directly (profile row may not exist yet if trigger lagged)
  const { data: list } = await supa.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = list?.users?.find((u) => u.email?.toLowerCase() === email);
  if (found) return found.id;

  // 3. Create new user. Generate a long random password — the user will sign
  //    in via magic link rather than typing it.
  const password = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 20) + "Aa9!";

  const { data: created, error } = await supa.auth.admin.createUser({
    email,
    password,
    email_confirm: true,        // skip the confirmation email — we'll send our own magic link
  });
  if (error || !created.user) {
    console.error("[finalize] createUser failed:", error?.message);
    return null;
  }
  return created.user.id;
}

// ─────────────────────────────────────────────────────────────────
// Email: magic link + order receipt
// ─────────────────────────────────────────────────────────────────

async function sendOrderEmail(opts: {
  orderId: string;
  email: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[finalize] RESEND_API_KEY missing — would send order email to", opts.email);
    return;
  }
  const resend = new Resend(apiKey);

  // Generate a magic-link login URL via Supabase admin.
  const supa = getSupabaseAdmin();
  let loginUrl: string | null = null;
  if (supa) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyhk.dev";
    const { data } = await supa.auth.admin.generateLink({
      type: "magiclink",
      email: opts.email,
      options: { redirectTo: `${siteUrl}/account/orders/${opts.orderId}` },
    });
    loginUrl = data?.properties?.action_link ?? null;
  }

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: opts.email,
      subject: "Your huyHK order is ready",
      html: `
        <div style="font-family: ui-serif, Georgia, serif; max-width: 540px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="font-size: 24px; font-weight: 500;">Thanks for the order.</h1>
          <p style="font-size: 16px; line-height: 1.6;">
            Your order <code style="font-family: ui-monospace, monospace; background: #f4f1ea; padding: 2px 6px; border-radius: 3px;">${opts.orderId.slice(0, 8)}</code>
            is confirmed. Click below to sign in and download:
          </p>
          ${loginUrl
            ? `<p style="margin: 24px 0;">
                 <a href="${loginUrl}" style="display: inline-block; background: #1a1a1a; color: #FAF8F5; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">Sign in &amp; download →</a>
               </p>`
            : `<p style="font-size: 14px; color: #4a4a4a;">Sign in at <a href="https://huyhk.dev/sign-in">huyhk.dev/sign-in</a> to download.</p>`}
          <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">
            We auto-created a passwordless account for you using this email — the
            link above signs you in. Set a password under Account → Security if you'd
            like one.
          </p>
          <hr style="border: 0; border-top: 1px solid rgba(26,26,26,0.12); margin: 32px 0;" />
          <p style="font-size: 13px; color: #8a8a8a; font-family: ui-monospace, monospace;">
            14-day refund policy · huyhk.dev
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[finalize] email send failed:", err);
  }
}
