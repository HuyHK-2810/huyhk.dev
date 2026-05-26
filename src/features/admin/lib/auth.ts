import { cookies } from "next/headers";
import { getCurrentProfile } from "@/lib/supabase/server";

const COOKIE_NAME = "hk_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export function getAdminToken(): string | null {
  return process.env.ADMIN_TOKEN ?? null;
}

/**
 * Bearer-token auth for API consumers (AI agents, scripts). Token comes from
 * `ADMIN_TOKEN` env. Kept independent of Supabase Auth because agents can't
 * "sign in" — they need a long-lived shared secret.
 */
export function verifyBearer(req: Request): boolean {
  const token = getAdminToken();
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  return constantTimeEqual(m[1], token);
}

/**
 * Cookie/session auth for /admin UI. Two acceptable paths:
 *
 *   1) Supabase Auth — the signed-in user has `role='admin'` in profiles.
 *      This is the path real humans should use.
 *   2) Legacy ADMIN_TOKEN cookie — keeps the original password gate working
 *      during the migration window. Remove once an admin profile exists.
 */
export async function verifySessionCookie(): Promise<boolean> {
  // Try Supabase Auth first.
  try {
    const profile = await getCurrentProfile();
    if (profile && profile.role === "admin") return true;
  } catch {
    // fall through to legacy check
  }

  // Legacy ADMIN_TOKEN path.
  const token = getAdminToken();
  if (!token) return false;
  const store = await cookies();
  const c = store.get(COOKIE_NAME)?.value;
  if (!c) return false;
  return constantTimeEqual(c, token);
}

export async function startSession(password: string): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  if (!constantTimeEqual(password, token)) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
