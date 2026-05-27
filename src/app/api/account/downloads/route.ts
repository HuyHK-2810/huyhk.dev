import { NextResponse } from "next/server";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { r2SignedDownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { order_id?: string; order_item_id?: string; r2_key?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.order_id || !body.order_item_id || !body.r2_key) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Verify the order belongs to this user AND it's paid AND the file is one
  // of the linked download_files (prevents arbitrary R2 key access).
  const supa = await createSupabaseServerClient();
  const { data: order } = await supa
    .from("market_orders")
    .select("id, status, user_id")
    .eq("id", body.order_id)
    .single();
  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json({ error: "order_not_paid" }, { status: 403 });
  }

  const { data: item } = await supa
    .from("market_order_items")
    .select("id, market_products(download_files)")
    .eq("id", body.order_item_id)
    .eq("order_id", body.order_id)
    .single();
  if (!item) return NextResponse.json({ error: "item_not_found" }, { status: 404 });

  type DF = { name: string; r2_key: string };
  const mp = item.market_products as unknown;
  const downloadFiles: DF[] = Array.isArray(mp)
    ? (((mp[0] ?? {}) as { download_files?: DF[] }).download_files ?? [])
    : ((mp as { download_files?: DF[] } | null)?.download_files ?? []);
  const allowed = downloadFiles.some((f) => f.r2_key === body.r2_key);
  if (!allowed) return NextResponse.json({ error: "file_not_in_order" }, { status: 403 });

  // Sign for 1 hour. Long enough for slow connections, short enough that a
  // shared link expires quickly.
  const url = await r2SignedDownloadUrl(body.r2_key, {
    expiresInSec: 3600,
    downloadFilename: body.filename,
  });

  // Increment counter
  await supa
    .from("market_order_items")
    .update({
      download_count: ((item as { download_count?: number }).download_count ?? 0) + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", body.order_item_id);

  return NextResponse.json({ url, expires_in_sec: 3600 });
}
