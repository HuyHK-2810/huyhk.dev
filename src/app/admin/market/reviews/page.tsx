import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import ReviewsModeration from "@/features/market/components/reviews-moderation";

export default async function ReviewsAdmin() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const supa = getSupabaseAdmin();
  const { data } = supa
    ? await supa
        .from("market_product_reviews")
        .select(
          "id, rating, title, body, status, created_at, market_products(slug, title)",
        )
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">Market — Reviews</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Reviews land here as `pending`. Approve or reject. Only `approved` show on product pages.
      </p>
      <div className="mt-8">
        <ReviewsModeration initial={(data ?? []) as Record<string, unknown>[]} />
      </div>
    </AdminShell>
  );
}
