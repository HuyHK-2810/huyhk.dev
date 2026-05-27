/**
 * Payment provider abstraction. Every provider (Stripe / VNPay / Momo / Wise)
 * implements PaymentProvider with the same shape so checkout + webhook code
 * doesn't care which one the buyer picked.
 */

export type PaymentProviderId = "stripe" | "wise" | "vnpay" | "momo";

export type CartLine = {
  productId: string;
  productSlug: string;
  categorySlug: string;
  title: string;
  unitPriceCents: number;     // BASE currency (USD)
  quantity: number;
};

export type CheckoutContext = {
  // Server-assigned order id (we create the row before redirecting to provider).
  orderId: string;
  // Cart snapshot
  lines: CartLine[];
  // Pricing snapshot
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  baseCurrency: "USD";          // we always store base USD
  // Buyer
  email: string;
  // Marketing
  discountCode?: string | null;
  affiliateSlug?: string | null;
  // Where to send the buyer after payment
  successUrl: string;
  cancelUrl: string;
  // Display currency the buyer was browsing in — used by providers that
  // support presenting a localized total (Stripe presentment, VNPay VND, etc.)
  displayCurrency: string;
  displayRate: number;
};

export type CreateCheckoutResult =
  | { ok: true; redirectUrl: string; sessionId: string }
  | { ok: false; error: string; code?: string };

export type WebhookContext = {
  // Raw body — providers require unmodified bytes for signature verification.
  body: string;
  headers: Headers;
};

export type WebhookEvent =
  | {
      type: "payment.succeeded";
      orderId: string;
      paymentIntentId: string;
      sessionId: string;
      amountCents: number;
      currency: string;
      email?: string;
      receiptUrl?: string;
    }
  | {
      type: "payment.failed";
      orderId: string;
      sessionId?: string;
      reason: string;
    }
  | {
      type: "refund.succeeded";
      orderId: string;
      refundId: string;
      amountCents: number;
    }
  | { type: "ignored"; reason: string };

export interface PaymentProvider {
  id: PaymentProviderId;
  displayName: string;
  /** True if provider has env-vars set and can be used. */
  isConfigured(): boolean;
  /** Currencies the provider accepts (ISO 4217). Empty array = any. */
  supportedCurrencies?: string[];
  createCheckoutSession(ctx: CheckoutContext): Promise<CreateCheckoutResult>;
  verifyAndParseWebhook(ctx: WebhookContext): Promise<WebhookEvent>;
  refund(opts: {
    paymentIntentId: string;
    amountCents?: number;          // partial refund; undefined = full
  }): Promise<{ ok: true; refundId: string } | { ok: false; error: string }>;
}
