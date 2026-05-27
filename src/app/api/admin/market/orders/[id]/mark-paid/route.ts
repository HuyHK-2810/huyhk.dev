import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import { finalizeSucceededOrder } from "@/features/orders/lib/finalize";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

type Params = { id: string };

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  const ok = (await verifySessionCookie()) || verifyBearer(req);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await finalizeSucceededOrder({
      orderId: id,
      paymentIntentId: `manual_${Date.now()}`,
      provider: "wise",
    });
    revalidateTag(MARKET_CACHE_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "finalize_failed" },
      { status: 500 },
    );
  }
}
