"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "flat";
  amount: number;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
};

export default function CouponsEditor({ initial }: { initial: Record<string, unknown>[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initial as Coupon[]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [amount, setAmount] = useState(10);
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/market/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          amount: type === "percent" ? amount : Math.round(amount * 100),
          max_uses: maxUses === "" ? null : Number(maxUses),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setCoupons((cs) => [json.coupon, ...cs]);
      setCode("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Coupon) {
    await fetch(`/api/admin/market/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    setCoupons((cs) => cs.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function deleteCoupon(c: Coupon) {
    if (!confirm(`Delete code ${c.code}?`)) return;
    await fetch(`/api/admin/market/coupons/${c.id}`, { method: "DELETE" });
    setCoupons((cs) => cs.filter((x) => x.id !== c.id));
  }

  function fmtAmount(c: Coupon) {
    return c.type === "percent" ? `${c.amount}%` : `$${(c.amount / 100).toFixed(2)}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="overflow-hidden rounded-md border border-[var(--line)]">
        {coupons.length === 0 && (
          <li className="px-4 py-8 text-center text-ink-faint">No coupons yet.</li>
        )}
        {coupons.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-[1fr_80px_100px_80px_120px] items-center gap-3 border-b border-[var(--line-soft)] px-4 py-3 last:border-b-0 hover:bg-paper-pure"
          >
            <span className="font-mono text-[13px] text-ink">{c.code}</span>
            <span className="font-mono text-[12px] text-ink-soft">{fmtAmount(c)}</span>
            <span className="font-mono text-[12px] text-ink-soft">
              {c.uses_count}/{c.max_uses ?? "∞"}
            </span>
            <span className="font-mono text-[11px] text-ink-faint">
              {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
            </span>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => toggle(c)}
                className={[
                  "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase",
                  c.is_active
                    ? "border-ember bg-ember-soft text-ember-deep"
                    : "border-[var(--line)] text-ink-faint",
                ].join(" ")}
              >
                {c.is_active ? "active" : "off"}
              </button>
              <button
                type="button"
                onClick={() => deleteCoupon(c)}
                className="font-mono text-[11px] text-ink-faint hover:text-[#C24A1F]"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-dashed border-[var(--line)] bg-paper-pure p-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          + New coupon
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_100px_100px_auto]">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[13px]"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "flat")}
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[12px]"
          >
            <option value="percent">% off</option>
            <option value="flat">$ off</option>
          </select>
          <input
            type="number"
            min={0}
            step={type === "percent" ? 1 : 0.01}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[13px]"
          />
          <input
            type="number"
            min={0}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="max uses (∞)"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[12px]"
          />
          <button
            type="button"
            onClick={create}
            disabled={busy || !code.trim()}
            className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>}
    </div>
  );
}
