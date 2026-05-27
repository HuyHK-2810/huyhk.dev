"use client";

import { useEffect } from "react";

/**
 * Tiny client component: when a URL has ?ref=<slug>, set the hk_ref cookie
 * for 30 days so the checkout API can attribute the order. Also POSTs a
 * click record to /api/market/affiliate-click for tracking.
 *
 * Mount once on /market or product detail pages (the high-intent surfaces).
 */
export default function AffiliateTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (!ref || !/^[a-zA-Z0-9_-]{1,32}$/.test(ref)) return;

    document.cookie = `hk_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

    // Fire-and-forget click record. Best-effort; failures are silent.
    fetch("/api/market/affiliate-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: ref,
        referrer: document.referrer || null,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => null);

    // Clean ?ref out of the URL so subsequent shares don't carry it.
    url.searchParams.delete("ref");
    window.history.replaceState(null, "", url.toString());
  }, []);

  return null;
}
