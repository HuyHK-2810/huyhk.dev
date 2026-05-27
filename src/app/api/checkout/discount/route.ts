import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { code?: string; subtotalCents?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const code = (body.code ?? "").trim().toUpperCase();
  const subtotalCents = Number(body.subtotalCents ?? 0);
  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });

  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });

  const { data, error } = await supa
    .from("market_discount_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (error || !data) return NextResponse.json({ error: "invalid_code" }, { status: 404 });

  const now = Date.now();
  if (data.expires_at && new Date(data.expires_at).getTime() < now) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }
  if (data.starts_at && new Date(data.starts_at).getTime() > now) {
    return NextResponse.json({ error: "not_yet_active" }, { status: 425 });
  }
  if (data.max_uses != null && data.uses_count >= data.max_uses) {
    return NextResponse.json({ error: "exhausted" }, { status: 410 });
  }

  // Compute applied amount.
  let amountCents = 0;
  if (data.type === "percent") {
    amountCents = Math.floor((subtotalCents * data.amount) / 100);
  } else if (data.type === "flat") {
    amountCents = Math.min(data.amount, subtotalCents);
  }

  return NextResponse.json({
    ok: true,
    amountCents,
    label: `${data.code} applied · ${
      data.type === "percent" ? `${data.amount}%` : `$${(data.amount / 100).toFixed(2)}`
    } off`,
    code: data.code,
    type: data.type,
  });
}
