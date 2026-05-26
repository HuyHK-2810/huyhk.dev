import { cookies } from "next/headers";

const COOKIE_NAME = "hk_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export function getAdminToken(): string | null {
  return process.env.ADMIN_TOKEN ?? null;
}

/** Used by Bearer-token API auth (e.g. AI calling /api/admin/posts). */
export function verifyBearer(req: Request): boolean {
  const token = getAdminToken();
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  return constantTimeEqual(m[1], token);
}

/** Used by cookie-based session for the /admin UI. */
export async function verifySessionCookie(): Promise<boolean> {
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
