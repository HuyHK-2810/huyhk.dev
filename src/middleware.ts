import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  return updateSupabaseSession(req);
}

export const config = {
  matcher: [
    /*
     * Run on every request EXCEPT static assets.
     * Public-facing routes still need session refresh so signed-in users
     * see auth-aware UI (e.g. "Hi, {name}" in nav).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2|woff|ttf|otf|map)$).*)",
  ],
};
