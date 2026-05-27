"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderRefundButton({
  orderId,
  refundableUntil,
}: {
  orderId: string;
  refundableUntil: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const remainingDays = Math.max(
    0,
    Math.ceil((new Date(refundableUntil).getTime() - Date.now()) / (24 * 3600 * 1000)),
  );

  async function refund() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, reason: reason.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "refund failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        Refund — {remainingDays} day{remainingDays === 1 ? "" : "s"} left
      </div>
      <p className="mt-2 font-serif text-[15px] leading-[1.55] text-ink">
        Within 14 days of purchase, you can refund yourself. Click below and the
        amount goes back to your card within a few business days.
      </p>
      {!confirmed ? (
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className="mt-4 rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft hover:border-[#C24A1F] hover:text-[#C24A1F]"
        >
          Request refund
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, helps Huy improve)"
            rows={2}
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[13px]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refund}
              disabled={busy}
              className="rounded-md bg-[#C24A1F] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Refunding…" : "Confirm refund"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmed(false)}
              className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft hover:border-ember"
            >
              Cancel
            </button>
          </div>
          {error && <p className="font-mono text-[11px] text-[#C24A1F]">{error}</p>}
        </div>
      )}
    </div>
  );
}
