"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cartItemCount,
  cartSubtotalCents,
  clearCart,
  loadCart,
  removeFromCart,
  setQuantity,
  type CartState,
} from "../lib/cart-store";

type FxRate = { quote: string; rate: number };

export default function CartPageClient({
  fxRates,
  displayCurrency,
}: {
  fxRates: FxRate[];
  displayCurrency: string;
}) {
  const [cart, setCart] = useState<CartState>({ items: [] });
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{
    ok: boolean;
    amountCents: number;
    message: string;
  } | null>(null);
  const [provider, setProvider] = useState<string>("stripe");
  const [availableProviders, setAvailableProviders] = useState<{ id: string; displayName: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart());
    setMounted(true);
    function onChange() {
      setCart(loadCart());
    }
    window.addEventListener("hk-cart-changed", onChange);
    return () => window.removeEventListener("hk-cart-changed", onChange);
  }, []);

  useEffect(() => {
    fetch(`/api/checkout/providers?currency=${displayCurrency}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableProviders(d.providers ?? []);
        if (d.providers?.[0]) setProvider(d.providers[0].id);
      })
      .catch(() => {
        setAvailableProviders([{ id: "stripe", displayName: "Card (Stripe)" }]);
      });
  }, [displayCurrency]);

  const subtotal = cartSubtotalCents(cart);
  const rate = fxRates.find((r) => r.quote === displayCurrency)?.rate ?? 1;
  const subtotalDisplay = formatMoney((subtotal / 100) * rate, displayCurrency);
  const discountCents = discountResult?.ok ? discountResult.amountCents : 0;
  const totalCents = Math.max(0, subtotal - discountCents);
  const totalDisplay = formatMoney((totalCents / 100) * rate, displayCurrency);

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim(), subtotalCents: subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDiscountResult({ ok: false, amountCents: 0, message: json.error ?? "invalid_code" });
      } else {
        setDiscountResult({ ok: true, amountCents: json.amountCents, message: json.label ?? "Applied" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (cart.items.length === 0) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          email,
          provider,
          discountCode: discountResult?.ok ? discountCode.trim() : null,
          displayCurrency,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
        setBusy(false);
        return;
      }
      // Redirect to provider hosted checkout
      window.location.href = json.redirectUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
      setBusy(false);
    }
  }

  if (!mounted) return null;

  if (cart.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-paper-pure p-10 text-center">
        <p className="font-serif text-[19px] italic leading-[1.55] text-ink-soft">
          Your cart is empty.
        </p>
        <Link
          href="/market"
          className="mt-4 inline-block font-mono text-[13px] text-ember hover:text-ember-deep"
        >
          ← browse the market
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      {/* LEFT — line items */}
      <div className="flex flex-col gap-3">
        {cart.items.map((item) => {
          const linePrice = formatMoney(
            ((item.unitPriceCents * item.quantity) / 100) * rate,
            displayCurrency,
          );
          return (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-md border border-[var(--line-soft)] bg-paper-pure p-4"
            >
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-md bg-ember-soft" />
              )}
              <div className="flex-1">
                <Link
                  href={`/market/${item.categorySlug}/${item.slug}`}
                  className="font-serif text-[16px] text-ink hover:text-ember"
                >
                  {item.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                  <button
                    type="button"
                    onClick={() => {
                      setCart(setQuantity(item.productId, item.quantity - 1));
                    }}
                    className="rounded border border-[var(--line)] px-1.5 hover:border-ember"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCart(setQuantity(item.productId, item.quantity + 1));
                    }}
                    className="rounded border border-[var(--line)] px-1.5 hover:border-ember"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setCart(removeFromCart(item.productId))}
                    className="ml-3 hover:text-[#C24A1F]"
                  >
                    remove
                  </button>
                </div>
              </div>
              <div className="font-mono text-[14px] text-ink">{linePrice}</div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setCart(clearCart())}
          className="mt-1 self-start font-mono text-[11px] text-ink-faint hover:text-[#C24A1F]"
        >
          Empty cart
        </button>
      </div>

      {/* RIGHT — checkout summary */}
      <aside className="flex flex-col gap-5 rounded-lg border border-[var(--line)] bg-paper-pure p-6">
        <h2 className="font-serif text-[20px] font-medium text-ink">Checkout</h2>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Email (receipt + login link)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[15px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Discount code (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="LAUNCH50"
              className="flex-1 rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[13px]"
            />
            <button
              type="button"
              onClick={applyDiscount}
              disabled={busy || !discountCode.trim()}
              className="rounded-md border border-[var(--line)] px-3 py-2 font-mono text-[12px] uppercase hover:border-ember"
            >
              Apply
            </button>
          </div>
          {discountResult && (
            <p
              className={
                "font-mono text-[11px] " +
                (discountResult.ok ? "text-ember-deep" : "text-[#C24A1F]")
              }
            >
              {discountResult.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Pay with
          </label>
          {availableProviders.length === 0 ? (
            <p className="font-mono text-[11px] text-[#C24A1F]">
              No payment providers configured. Set STRIPE_SECRET_KEY (etc.) in env.
            </p>
          ) : (
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[13px]"
            >
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          )}
        </div>

        <dl className="border-t border-[var(--line-soft)] pt-4 font-mono text-[13px]">
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-faint">Subtotal</dt>
            <dd className="text-ink">{subtotalDisplay}</dd>
          </div>
          {discountCents > 0 && (
            <div className="mt-1 flex items-baseline justify-between">
              <dt className="text-ink-faint">Discount</dt>
              <dd className="text-ember-deep">
                − {formatMoney((discountCents / 100) * rate, displayCurrency)}
              </dd>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-[var(--line-soft)] pt-3">
            <dt className="text-[14px] text-ink">Total</dt>
            <dd className="font-serif text-[22px] text-ink">{totalDisplay}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={checkout}
          disabled={busy || availableProviders.length === 0 || !email}
          className="rounded-md bg-ink px-5 py-4 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
        >
          {busy ? "Redirecting…" : `Pay ${totalDisplay} →`}
        </button>

        {error && <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>}

        <p className="font-mono text-[11px] text-ink-faint">
          14-day refund · Account auto-created · Downloads via email link
        </p>
      </aside>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  if (currency === "VND") return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
