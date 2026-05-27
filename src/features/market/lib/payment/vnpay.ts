import crypto from "node:crypto";
import type {
  CheckoutContext,
  CreateCheckoutResult,
  PaymentProvider,
  WebhookContext,
  WebhookEvent,
} from "./types";

/**
 * VNPay (vnpay.vn) — Vietnamese local card / banking gateway.
 *
 * Env needed:
 *   VNPAY_TMN_CODE      Merchant terminal ID
 *   VNPAY_HASH_SECRET   HMAC-SHA512 key
 *   VNPAY_PAY_URL       e.g. https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 *   VNPAY_RETURN_URL    e.g. https://huyhk.dev/api/webhooks/vnpay/return
 *   VNPAY_IPN_URL       Server-to-server IPN callback (same path, accessible publicly)
 *
 * Wire protocol summary:
 *   - Redirect buyer to PAY_URL with signed query params.
 *   - Buyer pays in VNPay UI.
 *   - VNPay calls IPN_URL with payment result (signed query) — that's our webhook.
 *   - VNPay also bounces buyer back to RETURN_URL (signed query) — we just show
 *     success/cancel based on it, but trust IPN for the order state.
 */

const tmnCode = process.env.VNPAY_TMN_CODE;
const hashSecret = process.env.VNPAY_HASH_SECRET;
const payUrl = process.env.VNPAY_PAY_URL;
const returnUrl = process.env.VNPAY_RETURN_URL;

export const vnpayProvider: PaymentProvider = {
  id: "vnpay",
  displayName: "VNPay (Vietnamese bank cards)",
  supportedCurrencies: ["VND"],

  isConfigured() {
    return Boolean(tmnCode && hashSecret && payUrl && returnUrl);
  },

  async createCheckoutSession(ctx: CheckoutContext): Promise<CreateCheckoutResult> {
    if (!this.isConfigured()) return { ok: false, error: "vnpay_not_configured" };

    // VNPay requires VND. Convert USD total → VND smallest unit.
    // VNPay expects amount × 100 (so VND 100,000 → 10000000).
    const vndAmount = Math.round((ctx.totalCents / 100) * ctx.displayRate);
    const amount = vndAmount * 100;

    const createDate = formatVnpayDate(new Date());
    const ipAddr = "127.0.0.1"; // overwritten upstream if you forward client IP
    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode!,
      vnp_Amount: String(amount),
      vnp_CurrCode: "VND",
      vnp_TxnRef: ctx.orderId,
      vnp_OrderInfo: `Order ${ctx.orderId}`,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_ReturnUrl: returnUrl!,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const signed = signVnpay(params, hashSecret!);
    const url = `${payUrl}?${signed}`;
    return { ok: true, sessionId: ctx.orderId, redirectUrl: url };
  },

  async verifyAndParseWebhook(ctx: WebhookContext): Promise<WebhookEvent> {
    if (!this.isConfigured()) return { type: "ignored", reason: "vnpay_not_configured" };

    // IPN uses query string, not body. Caller should pass the URL search via headers.
    const search = ctx.headers.get("x-vnpay-search") ?? ctx.body;
    const params = Object.fromEntries(new URLSearchParams(search));
    const receivedHash = params["vnp_SecureHash"];
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    const calc = hashVnpay(params, hashSecret!);
    if (receivedHash?.toLowerCase() !== calc.toLowerCase()) {
      throw new Error("vnpay_signature_invalid");
    }
    const status = params["vnp_ResponseCode"];
    const orderId = params["vnp_TxnRef"];
    if (status === "00") {
      return {
        type: "payment.succeeded",
        orderId,
        paymentIntentId: params["vnp_TransactionNo"] ?? "",
        sessionId: orderId,
        amountCents: Math.round(Number(params["vnp_Amount"] ?? 0) / 100), // VND
        currency: "VND",
      };
    }
    return {
      type: "payment.failed",
      orderId,
      reason: `vnpay_response_${status}`,
    };
  },

  async refund() {
    // VNPay refund requires a separate signed API call. Stub for now.
    return { ok: false, error: "vnpay_refund_via_dashboard" };
  },
};

function formatVnpayDate(d: Date): string {
  // yyyyMMddHHmmss in GMT+7
  const offset = 7 * 60 * 60 * 1000;
  const t = new Date(d.getTime() + offset);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}${pad(t.getUTCSeconds())}`;
}

function signVnpay(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const query = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  const hash = crypto.createHmac("sha512", secret).update(query, "utf-8").digest("hex");
  return `${query}&vnp_SecureHash=${hash}`;
}

function hashVnpay(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const query = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  return crypto.createHmac("sha512", secret).update(query, "utf-8").digest("hex");
}
