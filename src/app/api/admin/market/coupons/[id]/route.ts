import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

type Params = { id: string };
const ALLOWED = new Set([
  "code", "type", "amount", "max_uses", "expires_at",
  "per_user_limit", "is_active", "applies_to_product_id", "applies_to_category_id",
]);

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) if (ALLOWED.has(k)) update[k] = v;
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });

  const { data, error } = await supa.from("market_discount_codes").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupon: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  const { error } = await supa.from("market_discount_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
