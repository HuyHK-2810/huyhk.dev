import { cookies } from "next/headers";
import NavClient from "./nav-client";

/**
 * Display-only auth state for the nav. We deliberately DO NOT call
 * `auth.getUser()` here — that's a Supabase round-trip on every page render
 * (~150ms × every public page). Instead we cookie-sniff:
 *
 *   • If a Supabase session cookie exists → render the "Account" link
 *     optimistically. Clicking it goes to /account which validates server-side.
 *   • If no cookie → render "Sign in".
 *
 * Worst case for a stale cookie: a signed-in user with an expired session sees
 * "Account", clicks, and gets redirected to /sign-in. That's a one-off; the
 * trade-off is huge — public pages drop ~150ms of latency.
 */
export default async function Nav() {
  const store = await cookies();
  const hasSession = store
    .getAll()
    .some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
    );
  return <NavClient hasSession={hasSession} />;
}
