import { NextResponse } from "next/server";
import { listAvailableProviders } from "@/features/market/lib/payment";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currency = (url.searchParams.get("currency") ?? "USD").toUpperCase();
  const providers = listAvailableProviders(currency).map((p) => ({
    id: p.id,
    displayName: p.displayName,
  }));
  return NextResponse.json({ providers });
}
