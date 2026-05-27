import type {
  CheckoutContext,
  CreateCheckoutResult,
  PaymentProvider,
  WebhookContext,
  WebhookEvent,
} from "./types";

/**
 * Wise — manual bank-transfer flow. Wise Business doesn't have a true
 * customer-facing checkout API, so we render Huy's Wise account details on a
 * confirmation page and the admin marks the order paid by hand once the
 * transfer lands.
 *
 * Env needed (optional, shown to buyer for instructions):
 *   WISE_RECIPIENT_NAME    e.g. "Ho Khac Huy"
 *   WISE_RECIPIENT_EMAIL   e.g. "hk2810@…"
 *   WISE_BANK_ACCOUNT      account number / IBAN
 *   WISE_BANK_NAME         e.g. "Wise" or your bank
 *   WISE_BANK_SWIFT        BIC/SWIFT code if needed
 *   WISE_INSTRUCTIONS      free-text shown to buyer
 */

const recipientName = process.env.WISE_RECIPIENT_NAME;
const recipientEmail = process.env.WISE_RECIPIENT_EMAIL;
const bankAccount = process.env.WISE_BANK_ACCOUNT;

export const wiseProvider: PaymentProvider = {
  id: "wise",
  displayName: "Bank transfer (Wise)",

  isConfigured() {
    return Boolean(recipientName && (bankAccount || recipientEmail));
  },

  async createCheckoutSession(ctx: CheckoutContext): Promise<CreateCheckoutResult> {
    if (!this.isConfigured()) return { ok: false, error: "wise_not_configured" };
    // No remote session needed — return our own page that shows the bank
    // details and a "I've transferred" button. The button POSTs to a manual
    // confirm endpoint which marks the order awaiting-verification.
    return {
      ok: true,
      sessionId: `wise_${ctx.orderId}`,
      redirectUrl: `/checkout/wise/${ctx.orderId}`,
    };
  },

  async verifyAndParseWebhook(_ctx: WebhookContext): Promise<WebhookEvent> {
    // Wise has no webhook in this flow; admin clicks "Mark paid" in
    // /admin/market/orders/[id]. Webhook handler is a no-op.
    return { type: "ignored", reason: "wise_has_no_webhook" };
  },

  async refund() {
    return { ok: false, error: "wise_refunds_are_manual" };
  },
};
