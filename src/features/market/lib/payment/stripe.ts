import Stripe from "stripe";
import type {
  CheckoutContext,
  CreateCheckoutResult,
  PaymentProvider,
  WebhookContext,
  WebhookEvent,
} from "./types";

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

let _client: Stripe | null = null;
function client(): Stripe | null {
  if (!secretKey) return null;
  if (!_client) {
    _client = new Stripe(secretKey, {
      typescript: true,
      // Use SDK's default pinned API version; override here when migrating.
    });
  }
  return _client;
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",
  displayName: "Card (Stripe)",
  supportedCurrencies: [],   // Stripe accepts everything

  isConfigured() {
    return Boolean(secretKey);
  },

  async createCheckoutSession(ctx: CheckoutContext): Promise<CreateCheckoutResult> {
    const stripe = client();
    if (!stripe) return { ok: false, error: "stripe_not_configured" };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        // Present to the buyer in their browsing currency. Stripe handles
        // forex on the receipt — we keep the canonical totals in USD via the
        // order row.
        currency: ctx.displayCurrency.toLowerCase(),
        customer_email: ctx.email,
        success_url: `${ctx.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: ctx.cancelUrl,
        line_items: ctx.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: ctx.displayCurrency.toLowerCase(),
            product_data: {
              name: l.title,
              metadata: { product_id: l.productId, slug: l.productSlug },
            },
            // Convert USD cents → display currency cents.
            unit_amount: Math.round(l.unitPriceCents * ctx.displayRate),
          },
        })),
        // Apply discount as a Stripe coupon-on-the-fly if present.
        discounts: ctx.discountCents > 0
          ? [{
              coupon: await ensureOneOffCoupon(
                stripe,
                ctx.discountCents,
                ctx.discountCode ?? "MANUAL",
                ctx.displayCurrency.toLowerCase(),
                ctx.displayRate,
              ),
            }]
          : undefined,
        metadata: {
          order_id: ctx.orderId,
          affiliate_slug: ctx.affiliateSlug ?? "",
          discount_code: ctx.discountCode ?? "",
          base_currency: ctx.baseCurrency,
          base_total_cents: String(ctx.totalCents),
          display_rate: String(ctx.displayRate),
        },
        // Allow promotion codes UI in Stripe checkout (optional layer on top of our own).
        allow_promotion_codes: false,
      });
      if (!session.url) {
        return { ok: false, error: "stripe_session_no_url" };
      }
      return { ok: true, redirectUrl: session.url, sessionId: session.id };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "stripe_session_failed",
      };
    }
  },

  async verifyAndParseWebhook(ctx: WebhookContext): Promise<WebhookEvent> {
    const stripe = client();
    if (!stripe || !webhookSecret) {
      return { type: "ignored", reason: "stripe_not_configured" };
    }
    const sig = ctx.headers.get("stripe-signature") ?? "";
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(ctx.body, sig, webhookSecret);
    } catch (err) {
      throw new Error(
        `stripe_signature_invalid: ${err instanceof Error ? err.message : ""}`,
      );
    }
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) return { type: "ignored", reason: "no_order_id" };
        return {
          type: "payment.succeeded",
          orderId,
          paymentIntentId: String(session.payment_intent ?? ""),
          sessionId: session.id,
          amountCents: session.amount_total ?? 0,
          currency: (session.currency ?? "usd").toUpperCase(),
          email: session.customer_details?.email ?? session.customer_email ?? undefined,
          receiptUrl: undefined,
        };
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "payment.failed",
          orderId: session.metadata?.order_id ?? "",
          sessionId: session.id,
          reason: event.type,
        };
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const orderId = (charge.metadata?.order_id ?? "") as string;
        const refund = charge.refunds?.data?.[0];
        if (!refund) return { type: "ignored", reason: "no_refund_obj" };
        return {
          type: "refund.succeeded",
          orderId,
          refundId: refund.id,
          amountCents: refund.amount,
        };
      }
      default:
        return { type: "ignored", reason: event.type };
    }
  },

  async refund(opts) {
    const stripe = client();
    if (!stripe) return { ok: false, error: "stripe_not_configured" };
    try {
      const refund = await stripe.refunds.create({
        payment_intent: opts.paymentIntentId,
        amount: opts.amountCents,
      });
      return { ok: true, refundId: refund.id };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "refund_failed" };
    }
  },
};

async function ensureOneOffCoupon(
  stripe: Stripe,
  baseDiscountCents: number,
  label: string,
  displayCurrency: string,
  displayRate: number,
): Promise<string> {
  // Create a single-use coupon for the converted amount. Stripe's `amount_off`
  // takes the smallest unit in the same currency as the Checkout session.
  const amount = Math.round(baseDiscountCents * displayRate);
  const coupon = await stripe.coupons.create({
    duration: "once",
    amount_off: amount,
    currency: displayCurrency,
    name: label,
    max_redemptions: 1,
  });
  return coupon.id;
}
