"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  market_products: { slug: string; title: string } | null;
};

export default function ReviewsModeration({ initial }: { initial: Record<string, unknown>[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initial as Review[]);

  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    await fetch(`/api/admin/market/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Delete review permanently?")) return;
    await fetch(`/api/admin/market/reviews/${id}`, { method: "DELETE" });
    setReviews((rs) => rs.filter((r) => r.id !== id));
  }

  const groups: { label: string; key: Review["status"] }[] = [
    { label: "Pending", key: "pending" },
    { label: "Approved", key: "approved" },
    { label: "Rejected", key: "rejected" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ label, key }) => {
        const list = reviews.filter((r) => r.status === key);
        if (list.length === 0) return null;
        return (
          <section key={key}>
            <div className="section-label mb-3">{`{ ${label.toLowerCase()} (${list.length}) }`}</div>
            <ul className="flex flex-col gap-3">
              {list.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-mono text-[12px] text-ember-deep">
                        {"★".repeat(r.rating)}
                        <span className="text-ink-faint">{"★".repeat(5 - r.rating)}</span>
                      </span>
                      {r.title && (
                        <span className="ml-2 font-serif text-[15px] text-ink">{r.title}</span>
                      )}
                    </div>
                    <time className="font-mono text-[11px] text-ink-faint">
                      {new Date(r.created_at).toLocaleString()}
                    </time>
                  </div>
                  {r.body && <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">{r.body}</p>}
                  {r.market_products && (
                    <p className="mt-2 font-mono text-[11px] text-ink-faint">
                      Product: {r.market_products.title}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {key !== "approved" && (
                      <button
                        type="button"
                        onClick={() => setStatus(r.id, "approved")}
                        className="rounded-md border border-ember bg-ember-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ember-deep hover:bg-ember hover:text-paper-pure"
                      >
                        Approve
                      </button>
                    )}
                    {key !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => setStatus(r.id, "rejected")}
                        className="rounded-md border border-[var(--line)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft hover:border-[#C24A1F] hover:text-[#C24A1F]"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => del(r.id)}
                      className="ml-auto font-mono text-[11px] text-ink-faint hover:text-[#C24A1F]"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {reviews.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--line)] bg-paper-pure p-10 text-center font-serif text-[16px] italic text-ink-soft">
          No reviews yet.
        </p>
      )}
    </div>
  );
}
