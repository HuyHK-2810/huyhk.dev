import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import CurrencyPicker from "@/features/market/components/currency-picker";
import ProductCard from "@/features/market/components/product-card";
import {
  getActiveCategories,
  getFxRates,
  getPublishedProducts,
} from "@/features/market/lib/queries";

type Params = { category: string };

export async function generateStaticParams(): Promise<Params[]> {
  const cats = await getActiveCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const cats = await getActiveCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return { title: "Not found — huyHK Market" };
  return {
    title: `${cat.name} — huyHK Market`,
    description: cat.description ?? `${cat.name} from huyHK Market.`,
    alternates: { canonical: `/market/${cat.slug}` },
  };
}

async function resolveDisplayCurrency(): Promise<string> {
  const store = await cookies();
  const c = store.get("hk_currency")?.value;
  if (c && /^[A-Z]{3}$/.test(c)) return c;
  return "USD";
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const [cats, products, fxRates, displayCurrency] = await Promise.all([
    getActiveCategories(),
    getPublishedProducts(slug),
    getFxRates(),
    resolveDisplayCurrency(),
  ]);

  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="flex items-end justify-between gap-6 max-w-[var(--container-prose)]">
          <div>
            <Link
              href="/market"
              className="font-mono text-[13px] text-ink-faint hover:text-ember"
            >
              ← all categories
            </Link>
            <div className="section-label mt-6 mb-3">{`{ ${cat.slug} }`}</div>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] tracking-tight text-ink">
              {cat.name}
            </h1>
            {cat.description && (
              <p className="mt-4 max-w-[560px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft">
                {cat.description}
              </p>
            )}
            <p className="mt-4 font-mono text-[12px] text-ink-faint">
              {products.length} item{products.length === 1 ? "" : "s"}
            </p>
          </div>
          <CurrencyPicker />
        </div>

        {products.length === 0 ? (
          <section className="mt-16 rounded-lg border border-dashed border-[var(--line)] bg-paper-pure p-10 text-center">
            <p className="font-serif text-[19px] italic leading-[1.55] text-ink-soft">
              Nothing in this category yet. Check back soon.
            </p>
          </section>
        ) : (
          <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={cat}
                fxRates={fxRates}
                displayCurrency={displayCurrency}
              />
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
