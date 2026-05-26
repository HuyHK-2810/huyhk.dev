import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware-side Supabase. Refreshes the user's session cookie on every
 * request so server components see a current token. Must be invoked from
 * the root `middleware.ts`.
 */
export async function updateSupabaseSession(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supa = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) {
          req.cookies.set(name, value);
        }
        response = NextResponse.next({ request: req });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // CRITICAL: this call refreshes the access token if it's expired. Do NOT
  // run other code between createServerClient and getUser — per Supabase
  // SSR docs, the order matters.
  await supa.auth.getUser();

  return response;
}
