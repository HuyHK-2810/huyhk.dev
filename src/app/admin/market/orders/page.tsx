import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}
function fmtMoney(cents: number, currency: string): string {
  if (currency === "VND") return `${Math.round(cents / 100).toLocaleString("vi-VN")} ₫`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function AdminOrdersPage() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const supa = getSupabaseAdmin();
  const { data } = supa
    ? await supa
        .from("market_orders")
        .select("id, email, status, total_cents, currency, payment_provider, paid_at, created_at, affiliate_slug")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  type Row = {
    id: string;
    email: string;
    status: string;
    total_cents: number;
    currency: string;
    payment_provider: string;
    paid_at: string | null;
    created_at: string;
    affiliate_slug: string | null;
  };
  const orders = (data ?? []) as Row[];

  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">Market — Orders</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Most-recent first. Wise orders sit in <code>pending</code> until manually marked paid.
      </p>

      <div className="mt-8 overflow-hidden rounded-md border border-[var(--line)]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-paper-pure font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-faint">No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[var(--line-soft)] hover:bg-paper-pure">
                <td className="px-4 py-3 font-mono text-[12px]">
                  <Link href={`/admin/market/orders/${o.id}`} className="text-ink hover:text-ember">
                    {o.id.slice(0, 8)}
                  </Link>
                  {o.affiliate_slug && (
                    <span className="ml-2 rounded-full bg-ember-soft px-1.5 py-0.5 font-mono text-[9px] uppercase text-ember-deep">
                      ref:{o.affiliate_slug}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{o.email}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{o.payment_provider}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink">{fmtMoney(o.total_cents, o.currency)}</td>
                <td className="px-4 py-3">
                  <span className={[
                    "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]",
                    o.status === "paid"
                      ? "border-ember bg-ember-soft text-ember-deep"
                      : o.status === "pending"
                        ? "border-[var(--line)] text-ink-soft"
                        : "border-[var(--line-soft)] text-ink-faint",
                  ].join(" ")}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-faint">{fmtDate(o.paid_at ?? o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
