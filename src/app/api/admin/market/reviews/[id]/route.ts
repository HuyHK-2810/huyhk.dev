import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";
import { MARKET_CACHE_TAG } from "@/features/market/lib/queries";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

type Params = { id: string };

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  let body: { status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }
  if (!["approved", "rejected", "pending"].includes(body.status ?? "")) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const { data, error } = await supa
    .from("market_product_reviews")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(MARKET_CACHE_TAG);
  return NextResponse.json({ review: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  const { error } = await supa.from("market_product_reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
