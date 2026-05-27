import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";

export const runtime = "nodejs";

async function authorize(req: Request): Promise<boolean> {
  if (verifyBearer(req)) return true;
  return verifySessionCookie();
}

export async function GET(req: Request) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  const { data } = await supa
    .from("market_discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const code = (body.code as string ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });

  const type = body.type as string;
  if (type !== "percent" && type !== "flat") {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  if (type === "percent" && amount > 100) {
    return NextResponse.json({ error: "percent_out_of_range" }, { status: 400 });
  }

  const { data, error } = await supa
    .from("market_discount_codes")
    .insert({
      code,
      type,
      amount,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ?? null,
      per_user_limit: body.per_user_limit ?? 1,
      applies_to_product_id: body.applies_to_product_id ?? null,
      applies_to_category_id: body.applies_to_category_id ?? null,
    })
    .select()
    .single();
  if (error) {
    const code = error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status: code });
  }
  return NextResponse.json({ coupon: data }, { status: 201 });
}
