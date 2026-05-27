import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { stripeProvider } from "@/features/market/lib/payment/stripe";
import { finalizeSucceededOrder, recordFailedOrder, recordRefund } from "@/features/orders/lib/finalize";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text(); // raw bytes — required for Stripe signature
  let event;
  try {
    event = await stripeProvider.verifyAndParseWebhook({
      body,
      headers: req.headers,
    });
  } catch (err) {
    console.error("[webhook/stripe] verify failed:", err);
    return new NextResponse("invalid_signature", { status: 400 });
  }

  switch (event.type) {
    case "payment.succeeded":
      await finalizeSucceededOrder({
        orderId: event.orderId,
        paymentIntentId: event.paymentIntentId,
        provider: "stripe",
        email: event.email,
      });
      revalidateTag(MARKET_CACHE_TAG);
      break;
    case "payment.failed":
      await recordFailedOrder({ orderId: event.orderId, reason: event.reason });
      break;
    case "refund.succeeded":
      await recordRefund({
        orderId: event.orderId,
        refundId: event.refundId,
        amountCents: event.amountCents,
      });
      break;
    default:
      // ignored
      break;
  }
  return NextResponse.json({ received: true });
}
