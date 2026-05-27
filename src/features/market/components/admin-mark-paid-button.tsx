"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminMarkPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    if (!confirm("Mark this order as PAID? This triggers stock decrement + emails the buyer.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/market/orders/${orderId}/mark-paid`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-ember bg-ember-soft p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
        Wise manual confirmation
      </div>
      <p className="mt-2 font-serif text-[14px] leading-[1.55] text-ink">
        Verified the Wise transfer? Click below to mark the order paid. This is
        idempotent — running twice is safe.
      </p>
      <button
        type="button"
        onClick={mark}
        disabled={busy}
        className="mt-3 rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember disabled:opacity-60"
      >
        {busy ? "Marking…" : "Mark paid"}
      </button>
      {error && <p className="mt-2 font-mono text-[11px] text-[#C24A1F]">{error}</p>}
    </div>
  );
}
