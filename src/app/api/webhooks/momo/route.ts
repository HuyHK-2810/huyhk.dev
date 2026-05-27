import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { momoProvider } from "@/features/market/lib/payment/momo";
import {
  finalizeSucceededOrder,
  recordFailedOrder,
} from "@/features/orders/lib/finalize";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  try {
    const event = await momoProvider.verifyAndParseWebhook({
      body,
      headers: req.headers,
    });
    if (event.type === "payment.succeeded") {
      await finalizeSucceededOrder({
        orderId: event.orderId,
        paymentIntentId: event.paymentIntentId,
        provider: "momo",
      });
      revalidateTag(MARKET_CACHE_TAG);
    } else if (event.type === "payment.failed") {
      await recordFailedOrder({ orderId: event.orderId, reason: event.reason });
    }
    return NextResponse.json({ message: "received" });
  } catch (err) {
    console.error("[webhook/momo] err:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }
}
