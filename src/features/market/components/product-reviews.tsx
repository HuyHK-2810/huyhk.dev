import { getSupabaseRead } from "@/lib/supabase";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  display_name?: string | null;
};

async function fetchApprovedReviews(productId: string): Promise<Review[]> {
  const supa = getSupabaseRead();
  if (!supa) return [];
  const { data } = await supa
    .from("market_product_reviews")
    .select("id, rating, title, body, created_at, profiles(display_name)")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      rating: number;
      title: string | null;
      body: string | null;
      created_at: string;
      profiles:
        | { display_name: string | null }
        | { display_name: string | null }[]
        | null;
    };
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      created_at: r.created_at,
      display_name: p?.display_name ?? null,
    };
  });
}

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} of 5 stars`} className="text-ember">
      {"★".repeat(n)}
      <span className="text-ink-faint">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default async function ProductReviews({ productId }: { productId: string }) {
  const reviews = await fetchApprovedReviews(productId);

  if (reviews.length === 0) {
    return (
      <p className="font-serif text-[16px] italic leading-[1.55] text-ink-soft">
        No reviews yet. Buyers can post one from /account/orders within 14 days
        of purchase.
      </p>
    );
  }

  const avg =
    Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3 font-mono text-[13px] text-ink-soft">
        <Stars n={Math.round(avg)} />
        <span className="text-ink">{avg.toFixed(1)}</span>
        <span className="text-ink-faint">·</span>
        <span className="text-ink-faint">
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="flex flex-col gap-5">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <Stars n={r.rating} />
                {r.title && (
                  <span className="font-serif text-[16px] font-medium text-ink">
                    {r.title}
                  </span>
                )}
              </div>
              <time
                dateTime={r.created_at}
                className="font-mono text-[11px] text-ink-faint"
              >
                {new Date(r.created_at).toLocaleDateString()}
              </time>
            </div>
            {r.body && (
              <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">{r.body}</p>
            )}
            {r.display_name && (
              <p className="mt-2 font-mono text-[11px] text-ink-faint">— {r.display_name}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
