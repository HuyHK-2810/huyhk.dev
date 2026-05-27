import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import CouponsEditor from "@/features/market/components/coupons-editor";

export default async function CouponsPage() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const supa = getSupabaseAdmin();
  const { data } = supa
    ? await supa.from("market_discount_codes").select("*").order("created_at", { ascending: false })
    : { data: [] };

  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">Market — Coupons</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Codes apply at checkout (case-insensitive). Percent or flat USD off, optional product/category scope + expiry.
      </p>
      <div className="mt-8">
        <CouponsEditor initial={(data ?? []) as Record<string, unknown>[]} />
      </div>
    </AdminShell>
  );
}
