"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, cartItemCount, loadCart } from "../lib/cart-store";

type Props = {
  productId: string;
  slug: string;
  categorySlug: string;
  title: string;
  unitPriceCents: number;
  coverUrl: string | null;
  outOfStock: boolean;
};

export default function AddToCartButton(props: Props) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCount(cartItemCount(loadCart()));
    setMounted(true);
    function onChange() {
      setCount(cartItemCount(loadCart()));
    }
    window.addEventListener("hk-cart-changed", onChange);
    return () => window.removeEventListener("hk-cart-changed", onChange);
  }, []);

  function onAdd() {
    if (props.outOfStock) return;
    setBusy(true);
    addToCart({
      productId: props.productId,
      slug: props.slug,
      categorySlug: props.categorySlug,
      title: props.title,
      unitPriceCents: props.unitPriceCents,
      coverUrl: props.coverUrl,
    });
    setAdded(true);
    setBusy(false);
    setTimeout(() => setAdded(false), 1500);
  }

  if (props.outOfStock) {
    return (
      <button
        type="button"
        disabled
        className="rounded-md bg-ink px-5 py-4 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure opacity-50"
      >
        Sold out
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
        >
          {added ? "Added ✓" : "Add to cart"}
          {!added && (
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          )}
        </button>
        {mounted && count > 0 && (
          <Link
            href="/cart"
            className="rounded-md border border-[var(--line)] px-4 py-4 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft hover:border-ember hover:text-ember"
          >
            Cart · {count}
          </Link>
        )}
      </div>
      <p className="text-center font-mono text-[11px] text-ink-faint">
        Stripe · VNPay · MoMo · Wise · 14-day refund
      </p>
    </div>
  );
}
