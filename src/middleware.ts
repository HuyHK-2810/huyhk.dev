import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  return updateSupabaseSession(req);
}

export const config = {
  matcher: [
    /*
     * Skip:
     *   - Next internals (_next/static, _next/image)
     *   - Static files (images, fonts, etc.)
     *   - Feed/sitemap/OG endpoints (no user-aware UI; revalidated separately)
     *   - api/subscribe (public endpoint, no session needed)
     *
     * The remaining routes (pages + auth/admin API) still get session refresh
     * so signed-in users see name in nav and admin routes can gate.
     */
    "/((?!_next/static|_next/image|favicon.ico|feed.xml|sitemap.xml|opengraph-image|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2|woff|ttf|otf|map)$|api/subscribe).*)",
  ],
};
