import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server";
import OrderItemDownloads from "@/features/orders/components/order-item-downloads";
import OrderRefundButton from "@/features/orders/components/order-refund-button";
import OrderReviewForm from "@/features/orders/components/order-review-form";

export const metadata = {
  title: "Order — huyHK",
  robots: { index: false, follow: false },
};

type Params = { id: string };

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtMoney(cents: number, currency: string): string {
  if (currency === "VND") return `${Math.round(cents / 100).toLocaleString("vi-VN")} ₫`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account/orders");

  const { id } = await params;
  const supa = await createSupabaseServerClient();

  const { data: order } = await supa
    .from("market_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!order) notFound();

  const { data: items } = await supa
    .from("market_order_items")
    .select("*, market_products(id, slug, download_files, license_template)")
    .eq("order_id", id);

  const { data: refunds } = await supa
    .from("market_refunds")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const isPaid = order.status === "paid";
  const refundableUntil =
    isPaid && order.paid_at
      ? new Date(new Date(order.paid_at).getTime() + 14 * 24 * 3600 * 1000)
      : null;
  const canSelfRefund =
    isPaid && refundableUntil && refundableUntil.getTime() > Date.now() && order.payment_provider === "stripe";

  type LineItem = {
    id: string;
    product_id: string;
    product_title: string;
    product_slug: string;
    category_slug: string;
    unit_price_cents: number;
    quantity: number;
    market_products: {
      download_files: Array<{ name: string; r2_key: string; size: number; mime: string }>;
      license_template: string | null;
    };
  };
  const lineItems = (items ?? []) as unknown as LineItem[];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/account/orders"
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            ← all orders
          </Link>
          <div className="section-label mt-6 mb-3">{`{ order }`}</div>
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-tight text-ink">
            Order {order.id.slice(0, 8)}
          </h1>
          <p className="mt-3 font-mono text-[13px] text-ink-faint">
            {fmtDate(order.paid_at ?? order.created_at)} · {order.payment_provider} ·{" "}
            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[11px] uppercase",
                order.status === "paid"
                  ? "border-ember bg-ember-soft text-ember-deep"
                  : "border-[var(--line)] text-ink-soft",
              ].join(" ")}
            >
              {order.status}
            </span>
          </p>
        </div>

        {/* Line items */}
        <section className="mt-10 max-w-[var(--container-prose)] space-y-6">
          {lineItems.map((it) => (
            <div
              key={it.id}
              className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/market/${it.category_slug}/${it.product_slug}`}
                  className="font-serif text-[18px] font-medium text-ink hover:text-ember"
                >
                  {it.product_title}
                </Link>
                <span className="font-mono text-[13px] text-ink-soft">
                  ×{it.quantity} · {fmtMoney(it.unit_price_cents * it.quantity, order.currency)}
                </span>
              </div>
              {isPaid && (
                <OrderItemDownloads
                  orderId={order.id}
                  itemId={it.id}
                  files={it.market_products?.download_files ?? []}
                />
              )}
              {isPaid && (
                <div className="mt-4 border-t border-[var(--line-soft)] pt-4">
                  <OrderReviewForm productId={it.product_id} orderItemId={it.id} />
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Totals */}
        <section className="mt-8 max-w-[var(--container-prose)] rounded-md border border-[var(--line-soft)] bg-paper-pure p-5">
          <dl className="font-mono text-[13px]">
            <Row label="Subtotal">
              {fmtMoney(
                Math.round(order.subtotal_cents * Number(order.display_rate)),
                order.display_currency,
              )}
            </Row>
            {order.discount_cents > 0 && (
              <Row label={`Discount${order.discount_code ? ` (${order.discount_code})` : ""}`}>
                − {fmtMoney(
                  Math.round(order.discount_cents * Number(order.display_rate)),
                  order.display_currency,
                )}
              </Row>
            )}
            <Row label="Total" emphasis>
              {fmtMoney(
                Math.round(order.total_cents * Number(order.display_rate)),
                order.display_currency,
              )}
            </Row>
          </dl>
        </section>

        {/* Refund */}
        {canSelfRefund && (
          <section className="mt-6 max-w-[var(--container-prose)]">
            <OrderRefundButton orderId={order.id} refundableUntil={refundableUntil!.toISOString()} />
          </section>
        )}
        {!canSelfRefund && isPaid && (
          <p className="mt-6 max-w-[var(--container-prose)] font-mono text-[11px] text-ink-faint">
            Refund window has passed or this provider doesn't support self-service refunds.
            Email <a href="mailto:hkhuy2810@gmail.com" className="text-ember">hkhuy2810@gmail.com</a>.
          </p>
        )}

        {/* Refund history */}
        {refunds && refunds.length > 0 && (
          <section className="mt-6 max-w-[var(--container-prose)]">
            <div className="section-label mb-3">{`{ refunds }`}</div>
            <ul className="space-y-2 font-mono text-[12px] text-ink-soft">
              {refunds.map((r) => {
                type Refund = {
                  id: string;
                  amount_cents: number;
                  currency: string;
                  status: string;
                  source: string;
                  completed_at: string | null;
                  created_at: string;
                };
                const ref = r as unknown as Refund;
                return (
                  <li key={ref.id} className="flex items-baseline justify-between">
                    <span>
                      {fmtDate(ref.completed_at ?? ref.created_at)} · {ref.source} · {ref.status}
                    </span>
                    <span className="text-ink">
                      {fmtMoney(ref.amount_cents, ref.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function Row({ label, emphasis = false, children }: { label: string; emphasis?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "flex items-baseline justify-between border-b border-[var(--line-soft)] py-2 last:border-b-0",
        emphasis ? "pt-3 text-[16px] font-medium" : "",
      ].join(" ")}
    >
      <dt className={emphasis ? "text-ink" : "text-ink-faint"}>{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
