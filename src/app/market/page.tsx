import Link from "next/link";
import { cookies } from "next/headers";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import CurrencyPicker from "@/features/market/components/currency-picker";
import AffiliateTracker from "@/features/market/components/affiliate-tracker";
import ProductCard from "@/features/market/components/product-card";
import {
  getActiveCategories,
  getFeaturedProducts,
  getFxRates,
  getPublishedProducts,
} from "@/features/market/lib/queries";

export const metadata = {
  title: "Market — huyHK",
  description:
    "Books, themes, AI workflows, and tools — from the same hands that wrote the blog.",
  alternates: { canonical: "/market" },
};

async function resolveDisplayCurrency(): Promise<string> {
  const store = await cookies();
  const c = store.get("hk_currency")?.value;
  if (c && /^[A-Z]{3}$/.test(c)) return c;
  return "USD";
}

export default async function MarketIndex() {
  const [categories, featured, fxRates, all, displayCurrency] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(4),
    getFxRates(),
    getPublishedProducts(),
    resolveDisplayCurrency(),
  ]);

  // Count per category for the grid
  const counts = new Map<string, number>();
  for (const p of all) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);

  return (
    <>
      <Nav />
      <AffiliateTracker />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 max-w-[var(--container-prose)]">
          <div>
            <div className="section-label mb-3">{`{ market }`}</div>
            <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-normal leading-[1.1] tracking-tight text-ink">
              Things I&apos;ve <span className="italic text-ember">shipped</span> for sale.
            </h1>
            <p className="mt-5 max-w-[560px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft md:text-[19px]">
              Books, themes, AI workflows, and tools — built in the same voice as
              the writing. Buy once, download forever, refund within 14 days.
            </p>
          </div>
          <CurrencyPicker />
        </div>

        {/* Categories grid */}
        <section className="mt-12">
          <div className="section-label mb-4">{`{ categories }`}</div>
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-[var(--line-soft)] sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, idx) => (
              <Link
                key={c.id}
                href={`/market/${c.slug}`}
                className="group flex flex-col gap-3 bg-paper-pure p-6 transition-colors hover:bg-ember-soft md:p-7"
              >
                <div className="font-mono text-[12px] text-ember-deep">
                  {String(idx + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                </div>
                <h3 className="font-serif text-[22px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-[14px] leading-[1.55] text-ink-soft">{c.description}</p>
                )}
                <span className="mt-auto font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  {counts.get(c.id) ?? 0} item{(counts.get(c.id) ?? 0) === 1 ? "" : "s"} →
                </span>
              </Link>
            ))}
          </ol>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mt-16">
            <div className="section-label mb-4">{`{ featured }`}</div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                if (!cat) return null;
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={cat}
                    fxRates={fxRates}
                    displayCurrency={displayCurrency}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {all.length === 0 && (
          <section className="mt-16 rounded-lg border border-dashed border-[var(--line)] bg-paper-pure p-10 text-center">
            <p className="font-serif text-[19px] italic leading-[1.55] text-ink-soft">
              The shelves are stocking. First releases land soon.
            </p>
            <p className="mt-3 font-mono text-[12px] text-ink-faint">
              <Link href="/#contact" className="hover:text-ember">
                ← back to the blog
              </Link>
            </p>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
