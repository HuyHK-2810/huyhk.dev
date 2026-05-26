import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    // Soft-fail in local/dev: surface a clear message but don't blow up.
    console.warn(
      "[/api/subscribe] RESEND_API_KEY or RESEND_AUDIENCE_ID missing — logged instead:",
      email,
    );
    return NextResponse.json(
      { ok: true, mock: true },
      { status: 200 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (result.error) {
      // Resend returns 422 for duplicate contacts; treat as success.
      const msg = result.error.message?.toLowerCase() ?? "";
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        return NextResponse.json({ ok: true, already: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "provider_error", detail: result.error.message },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/subscribe] unexpected error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
