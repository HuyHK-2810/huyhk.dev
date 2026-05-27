import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const IP_SALT = process.env.AFFILIATE_IP_SALT ?? "hk-aff";

export async function POST(req: Request) {
  let body: { slug?: string; referrer?: string | null; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ ok: true });

  const { data: aff } = await supa
    .from("market_affiliates")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!aff) return NextResponse.json({ ok: true });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";
  const ipHash = ip
    ? crypto.createHash("sha256").update(ip + IP_SALT).digest("hex").slice(0, 32)
    : null;

  await supa.from("market_affiliate_clicks").insert({
    affiliate_id: aff.id,
    visitor_id: req.headers.get("cookie")?.match(/hk_ref=([^;]+)/)?.[1] ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
    referrer: body.referrer ?? null,
    ip_hash: ipHash,
  });

  return NextResponse.json({ ok: true });
}
