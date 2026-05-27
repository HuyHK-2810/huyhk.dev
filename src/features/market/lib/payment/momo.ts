import crypto from "node:crypto";
import type {
  CheckoutContext,
  CreateCheckoutResult,
  PaymentProvider,
  WebhookContext,
  WebhookEvent,
} from "./types";

/**
 * MoMo (momo.vn) — Vietnamese mobile wallet, QR + AppOpen flows.
 *
 * Env needed:
 *   MOMO_PARTNER_CODE    e.g. MOMOXXXX
 *   MOMO_ACCESS_KEY
 *   MOMO_SECRET_KEY
 *   MOMO_ENDPOINT        e.g. https://test-payment.momo.vn/v2/gateway/api/create
 *   MOMO_RETURN_URL      e.g. https://huyhk.dev/checkout/success
 *   MOMO_IPN_URL         server-to-server, e.g. https://huyhk.dev/api/webhooks/momo
 *
 * MoMo accepts only VND. Same conversion logic as VNPay.
 */

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const endpoint = process.env.MOMO_ENDPOINT;
const returnUrl = process.env.MOMO_RETURN_URL;
const ipnUrl = process.env.MOMO_IPN_URL;

export const momoProvider: PaymentProvider = {
  id: "momo",
  displayName: "MoMo (Vietnamese mobile wallet)",
  supportedCurrencies: ["VND"],

  isConfigured() {
    return Boolean(partnerCode && accessKey && secretKey && endpoint && returnUrl && ipnUrl);
  },

  async createCheckoutSession(ctx: CheckoutContext): Promise<CreateCheckoutResult> {
    if (!this.isConfigured()) return { ok: false, error: "momo_not_configured" };

    const vndAmount = Math.round((ctx.totalCents / 100) * ctx.displayRate);
    const requestId = `${ctx.orderId}-${Date.now()}`;
    const orderInfo = `huyhk.dev order ${ctx.orderId}`;
    const extraData = "";
    const requestType = "captureWallet";

    // MoMo signature: HMAC-SHA256 of fixed-order param string.
    const rawSig = [
      `accessKey=${accessKey}`,
      `amount=${vndAmount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${ctx.orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${partnerCode}`,
      `redirectUrl=${returnUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");
    const signature = crypto.createHmac("sha256", secretKey!).update(rawSig).digest("hex");

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: String(vndAmount),
      orderId: ctx.orderId,
      orderInfo,
      redirectUrl: returnUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    try {
      const res = await fetch(endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { payUrl?: string; deeplink?: string; errorCode?: number; message?: string };
      if (!res.ok || !json.payUrl) {
        return { ok: false, error: `momo_${json.errorCode ?? res.status}: ${json.message ?? ""}` };
      }
      return { ok: true, sessionId: requestId, redirectUrl: json.payUrl };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "momo_request_failed" };
    }
  },

  async verifyAndParseWebhook(ctx: WebhookContext): Promise<WebhookEvent> {
    if (!this.isConfigured()) return { type: "ignored", reason: "momo_not_configured" };
    let data: Record<string, string>;
    try {
      data = JSON.parse(ctx.body);
    } catch {
      throw new Error("momo_invalid_body");
    }

    const signFields = [
      "accessKey",
      "amount",
      "extraData",
      "message",
      "orderId",
      "orderInfo",
      "orderType",
      "partnerCode",
      "payType",
      "requestId",
      "responseTime",
      "resultCode",
      "transId",
    ];
    const raw = signFields.map((k) => `${k}=${data[k] ?? ""}`).join("&");
    const calc = crypto.createHmac("sha256", secretKey!).update(raw).digest("hex");
    if (calc !== data.signature) {
      throw new Error("momo_signature_invalid");
    }
    const orderId = data.orderId;
    if (data.resultCode === "0") {
      return {
        type: "payment.succeeded",
        orderId,
        paymentIntentId: data.transId ?? "",
        sessionId: data.requestId ?? "",
        amountCents: Math.round(Number(data.amount ?? 0) * 100),
        currency: "VND",
      };
    }
    return {
      type: "payment.failed",
      orderId,
      reason: `momo_${data.resultCode}: ${data.message}`,
    };
  },

  async refund() {
    // MoMo refund via separate API; stub for now.
    return { ok: false, error: "momo_refund_via_dashboard" };
  },
};
