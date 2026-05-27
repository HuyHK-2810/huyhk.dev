import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import AdminMarkPaidButton from "@/features/market/components/admin-mark-paid-button";

type Params = { id: string };

function fmtMoney(cents: number, currency: string): string {
  if (currency === "VND") return `${Math.round(cents / 100).toLocaleString("vi-VN")} ₫`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function AdminOrderDetail({ params }: { params: Promise<Params> }) {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");
  const { id } = await params;

  const supa = getSupabaseAdmin();
  if (!supa) notFound();
  const { data: order } = await supa.from("market_orders").select("*").eq("id", id).single();
  if (!order) notFound();
  const { data: items } = await supa
    .from("market_order_items")
    .select("*")
    .eq("order_id", id);
  const { data: refunds } = await supa
    .from("market_refunds")
    .select("*")
    .eq("order_id", id);

  return (
    <AdminShell>
      <Link href="/admin/market/orders" className="font-mono text-[12px] text-ink-faint hover:text-ember">
        ← all orders
      </Link>
      <h1 className="mt-4 font-serif text-[28px] font-normal text-ink">
        Order {order.id.slice(0, 8)}
      </h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        {order.email} · {order.payment_provider} ·{" "}
        <span className={[
          "rounded-full border px-2 py-0.5",
          order.status === "paid"
            ? "border-ember bg-ember-soft text-ember-deep"
            : "border-[var(--line)] text-ink-soft",
        ].join(" ")}>{order.status}</span>
      </p>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-[var(--line)] bg-paper-pure p-5">
          <div className="section-label mb-3">{`{ items }`}</div>
          <ul className="space-y-2">
            {(items ?? []).map((it) => {
              const item = it as Record<string, unknown>;
              return (
                <li key={item.id as string} className="flex items-baseline justify-between gap-3 font-mono text-[13px]">
                  <span className="text-ink">{item.product_title as string} ×{item.quantity as number}</span>
                  <span className="text-ink-soft">
                    {fmtMoney((item.unit_price_cents as number) * (item.quantity as number), order.currency)}
                  </span>
                </li>
              );
            })}
          </ul>

          {refunds && refunds.length > 0 && (
            <>
              <div className="section-label mt-6 mb-3">{`{ refunds }`}</div>
              <ul className="space-y-1 font-mono text-[12px] text-ink-soft">
                {refunds.map((r) => {
                  const ref = r as Record<string, unknown>;
                  return (
                    <li key={ref.id as string} className="flex items-baseline justify-between">
                      <span>{ref.source as string} · {ref.status as string}</span>
                      <span className="text-ink">{fmtMoney(ref.amount_cents as number, ref.currency as string)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-md border border-[var(--line)] bg-paper-pure p-5 font-mono text-[12px]">
            <Row label="Subtotal">{fmtMoney(order.subtotal_cents, order.currency)}</Row>
            {order.discount_cents > 0 && (
              <Row label={`Discount${order.discount_code ? ` (${order.discount_code})` : ""}`}>
                − {fmtMoney(order.discount_cents, order.currency)}
              </Row>
            )}
            <Row label="Total" emphasis>{fmtMoney(order.total_cents, order.currency)}</Row>
            <Row label="Display">{fmtMoney(Math.round(order.total_cents * Number(order.display_rate)), order.display_currency)}</Row>
            {order.affiliate_slug && <Row label="Affiliate">{order.affiliate_slug}</Row>}
            {order.payment_intent_id && <Row label="Payment ID">{order.payment_intent_id.slice(0, 24)}…</Row>}
            <Row label="Paid">{order.paid_at ? new Date(order.paid_at).toLocaleString() : "—"}</Row>
          </div>

          {order.status === "pending" && order.payment_provider === "wise" && (
            <AdminMarkPaidButton orderId={order.id} />
          )}
        </aside>
      </section>
    </AdminShell>
  );
}

function Row({ label, emphasis = false, children }: { label: string; emphasis?: boolean; children: React.ReactNode }) {
  return (
    <div className={[
      "flex items-baseline justify-between border-b border-[var(--line-soft)] py-2 last:border-b-0",
      emphasis ? "pt-3 text-[14px]" : "",
    ].join(" ")}>
      <span className={emphasis ? "text-ink" : "text-ink-faint"}>{label}</span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
