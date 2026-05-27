"use client";

import { useState } from "react";

export default function OrderReviewForm({
  productId,
  orderItemId,
}: {
  productId: string;
  orderItemId: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          order_item_id: orderItemId,
          rating,
          title: title.trim() || null,
          body: bodyText.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "submit failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="font-mono text-[11px] text-ember-deep">
        ✓ Review submitted. Pending admin approval.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[11px] text-ink-faint hover:text-ember"
      >
        + Write a review
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        Your review
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={[
              "text-[20px]",
              n <= rating ? "text-ember" : "text-ink-faint",
            ].join(" ")}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 font-mono text-[12px] text-ink-soft">{rating}/5</span>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[14px]"
      />
      <textarea
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        rows={3}
        placeholder="What did you think?"
        className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[14px]"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft hover:border-ember"
        >
          Cancel
        </button>
      </div>
      {error && <p className="font-mono text-[11px] text-[#C24A1F]">{error}</p>}
    </div>
  );
}
