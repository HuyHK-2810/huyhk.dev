import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  return updateSupabaseSession(req);
}

export const config = {
  matcher: [
    /*
     * Run middleware ONLY on auth-touched routes. Public pages (/, /writing/*,
     * /work/*, /cv, /pricing/*) skip middleware entirely — saves ~100-200ms
     * per request (no Supabase auth.getUser() round-trip).
     *
     * Public-page nav cookie-sniffs the session presence locally (see
     * src/components/brand/nav.tsx) for display, then any privileged route
     * validates server-side here.
     */
    "/admin/:path*",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
    "/auth/:path*",
    "/api/admin/:path*",
  ],
};
