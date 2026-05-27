import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Orders — huyHK",
  robots: { index: false, follow: false },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function fmtMoney(cents: number, currency: string): string {
  if (currency === "VND") return `${Math.round(cents / 100).toLocaleString("vi-VN")} ₫`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account/orders");

  const supa = await createSupabaseServerClient();
  const { data } = await supa
    .from("market_orders")
    .select("id, status, total_cents, currency, display_currency, display_rate, paid_at, created_at, payment_provider")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    status: string;
    total_cents: number;
    currency: string;
    display_currency: string;
    display_rate: string;
    paid_at: string | null;
    created_at: string;
    payment_provider: string;
  };
  const orders = (data ?? []) as Row[];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/account"
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            ← account
          </Link>
          <div className="section-label mt-6 mb-3">{`{ orders }`}</div>
          <h1 className="font-serif text-[clamp(32px,5vw,44px)] font-normal leading-[1.15] tracking-tight text-ink">
            Your orders.
          </h1>
        </div>

        {orders.length === 0 ? (
          <section className="mt-12 rounded-lg border border-dashed border-[var(--line)] bg-paper-pure p-10 text-center">
            <p className="font-serif text-[19px] italic leading-[1.55] text-ink-soft">
              No orders yet.
            </p>
            <Link
              href="/market"
              className="mt-4 inline-block font-mono text-[13px] text-ember hover:text-ember-deep"
            >
              ← browse the market
            </Link>
          </section>
        ) : (
          <ul className="mt-10 max-w-[var(--container-prose)] flex flex-col">
            {orders.map((o, idx) => (
              <li
                key={o.id}
                className={idx > 0 ? "border-t border-[var(--line-soft)]" : ""}
              >
                <Link
                  href={`/account/orders/${o.id}`}
                  className="group flex items-center justify-between gap-4 py-5 transition-all duration-300 hover:pl-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[12px] text-ember-deep">
                      {fmtDate(o.paid_at ?? o.created_at)}
                    </span>
                    <span className="font-serif text-[17px] text-ink transition-colors group-hover:text-ember">
                      Order {o.id.slice(0, 8)}
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {o.payment_provider} · {o.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[18px] text-ink">
                      {fmtMoney(
                        Math.round(o.total_cents * Number(o.display_rate)),
                        o.display_currency,
                      )}
                    </div>
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
                        o.status === "paid"
                          ? "border-ember bg-ember-soft text-ember-deep"
                          : o.status === "pending"
                            ? "border-[var(--line)] text-ink-soft"
                            : "border-[var(--line-soft)] text-ink-faint",
                      ].join(" ")}
                    >
                      {o.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
