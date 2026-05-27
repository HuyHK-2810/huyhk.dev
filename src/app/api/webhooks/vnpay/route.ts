import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { vnpayProvider } from "@/features/market/lib/payment/vnpay";
import {
  finalizeSucceededOrder,
  recordFailedOrder,
} from "@/features/orders/lib/finalize";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

// VNPay IPN sends query params, not body. We forward the search string via a
// pseudo-header so the provider helper can re-parse it.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  const headers = new Headers(req.headers);
  headers.set("x-vnpay-search", search);

  try {
    const event = await vnpayProvider.verifyAndParseWebhook({ body: "", headers });
    if (event.type === "payment.succeeded") {
      await finalizeSucceededOrder({
        orderId: event.orderId,
        paymentIntentId: event.paymentIntentId,
        provider: "vnpay",
      });
      revalidateTag(MARKET_CACHE_TAG);
      // VNPay expects a specific JSON response.
      return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
    }
    if (event.type === "payment.failed") {
      await recordFailedOrder({ orderId: event.orderId, reason: event.reason });
      return NextResponse.json({ RspCode: "00", Message: "Acknowledged" });
    }
    return NextResponse.json({ RspCode: "00", Message: "Ignored" });
  } catch (err) {
    console.error("[webhook/vnpay] err:", err);
    return NextResponse.json({ RspCode: "97", Message: "Invalid Signature" }, { status: 400 });
  }
}
