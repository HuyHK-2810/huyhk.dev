"use client";

import { useState } from "react";

type File = { name: string; r2_key: string; size: number; mime: string };

export default function OrderItemDownloads({
  orderId,
  itemId,
  files,
}: {
  orderId: string;
  itemId: string;
  files: File[];
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!files || files.length === 0) {
    return (
      <p className="mt-3 font-mono text-[11px] text-ink-faint">
        No downloadable files attached to this product yet. Email
        <a href="mailto:hkhuy2810@gmail.com" className="text-ember"> hkhuy2810@gmail.com</a>
        {" "}if this seems wrong.
      </p>
    );
  }

  async function getLink(file: File) {
    setBusyKey(file.r2_key);
    setError(null);
    try {
      const res = await fetch("/api/account/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          order_item_id: itemId,
          r2_key: file.r2_key,
          filename: file.name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      // Open the signed URL in a new tab — browser will download via Content-Disposition.
      window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "download failed");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        Downloads
      </div>
      <ul className="space-y-1.5">
        {files.map((f) => (
          <li
            key={f.r2_key}
            className="flex items-center justify-between gap-3 rounded-md border border-[var(--line-soft)] bg-paper px-3 py-2"
          >
            <span className="font-mono text-[13px] text-ink">{f.name}</span>
            <div className="flex items-center gap-3 font-mono text-[11px] text-ink-faint">
              <span>{Math.round(f.size / 1024)} KB</span>
              <button
                type="button"
                onClick={() => getLink(f)}
                disabled={busyKey === f.r2_key}
                className="rounded border border-ember bg-ember-soft px-2 py-0.5 text-ember-deep hover:bg-ember hover:text-paper-pure disabled:opacity-60"
              >
                {busyKey === f.r2_key ? "…" : "Download"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="font-mono text-[11px] text-[#C24A1F]">{error}</p>}
    </div>
  );
}
