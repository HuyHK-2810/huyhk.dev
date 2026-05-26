import { NextResponse } from "next/server";
import { clearSession, startSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const password = (body.password ?? "").trim();
  if (!password) return NextResponse.json({ error: "missing_password" }, { status: 400 });

  const ok = await startSession(password);
  if (!ok) return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
