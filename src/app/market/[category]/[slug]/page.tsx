import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import CurrencyPicker from "@/features/market/components/currency-picker";
import {
  convertPrice,
  getFxRates,
  getProductBySlug,
} from "@/features/market/lib/queries";
import { renderMarkdown } from "@/features/blog/lib/markdown";
import AddToCartButton from "@/features/cart/components/add-to-cart-button";
import ProductReviews from "@/features/market/components/product-reviews";

type Params = { category: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const res = await getProductBySlug(category, slug);
  if (!res) return { title: "Not found — huyHK Market" };
  const { product, category: cat } = res;
  return {
    title: `${product.title} — huyHK ${cat.name}`,
    description: product.shortDescription ?? product.title,
    alternates: { canonical: `/market/${cat.slug}/${product.slug}` },
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? undefined,
      images: product.coverUrl ? [product.coverUrl] : undefined,
    },
  };
}

async function resolveDisplayCurrency(): Promise<string> {
  const store = await cookies();
  const c = store.get("hk_currency")?.value;
  if (c && /^[A-Z]{3}$/.test(c)) return c;
  return "USD";
}

export default async function ProductDetail({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const [res, fxRates, displayCurrency] = await Promise.all([
    getProductBySlug(category, slug),
    getFxRates(),
    resolveDisplayCurrency(),
  ]);
  if (!res) notFound();
  const { product, category: cat } = res;

  const price = convertPrice(product.priceCents, product.currency, displayCurrency, fxRates);
  const compareAt = product.compareAtPriceCents
    ? convertPrice(product.compareAtPriceCents, product.currency, displayCurrency, fxRates)
    : null;

  const renderedDescription = await renderMarkdown(product.description);
  const outOfStock = product.stockCount <= 0;
  const metadataEntries = Object.entries(product.metadata ?? {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/market/${cat.slug}`}
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            ← {cat.name}
          </Link>
          <CurrencyPicker />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* LEFT — visuals */}
          <div className="flex flex-col gap-4">
            {product.coverUrl ? (
              <div className="aspect-[4/3] overflow-hidden rounded-lg border border-[var(--line-soft)] bg-paper-pure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.coverUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-[var(--line-soft)] bg-ember-soft font-mono text-[12px] uppercase tracking-[0.1em] text-ember-deep">
                {cat.name}
              </div>
            )}

            {product.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.gallery.slice(0, 8).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${product.title} — ${i + 1}`}
                    className="aspect-square w-full rounded-md border border-[var(--line-soft)] object-cover"
                  />
                ))}
              </div>
            )}

            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-paper-pure px-5 py-3 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-soft transition-colors hover:border-ember hover:text-ember"
              >
                <span>↗ live demo</span>
                <span className="text-ink-faint">{new URL(product.demoUrl).host}</span>
              </a>
            )}

            {product.previewFiles.length > 0 && (
              <div className="rounded-md border border-[var(--line-soft)] bg-paper-pure p-5">
                <div className="section-label mb-3">{"{ preview }"}</div>
                <ul className="space-y-2">
                  {product.previewFiles.map((f) => (
                    <li
                      key={f.r2_key}
                      className="flex items-center justify-between gap-3 font-mono text-[13px]"
                    >
                      <span className="text-ink">{f.name}</span>
                      <span className="text-ink-faint">{Math.round(f.size / 1024)} KB</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[11px] text-ink-faint">
                  Preview files are free to download. Full files unlock on purchase.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — purchase panel */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-ember-deep">
                {cat.name}
              </div>
              <h1 className="mt-2 font-serif text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-tight text-ink">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-3 font-serif text-[19px] font-light leading-[1.5] text-ink-soft">
                  {product.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-baseline gap-3 border-y border-[var(--line-soft)] py-5">
              <span className="font-serif text-[clamp(28px,3.4vw,36px)] font-medium text-ink">
                {price.formatted}
              </span>
              {compareAt && (
                <span className="font-mono text-[14px] text-ink-faint line-through">
                  {compareAt.formatted}
                </span>
              )}
              {compareAt && (
                <span className="ml-auto rounded-full bg-ember-soft px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
                  save{" "}
                  {Math.round(
                    (1 - product.priceCents / product.compareAtPriceCents!) * 100,
                  )}
                  %
                </span>
              )}
            </div>

            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              categorySlug={cat.slug}
              title={product.title}
              unitPriceCents={product.priceCents}
              coverUrl={product.coverUrl}
              outOfStock={outOfStock}
            />

            {/* Spec table */}
            {metadataEntries.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--line-soft)] pt-5 font-mono text-[13px]">
                {metadataEntries.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-faint">{k.replace(/_/g, " ")}</dt>
                    <dd className="text-ink">
                      {Array.isArray(v) ? v.join(", ") : String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[11px] text-ink-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Description (long-form markdown) */}
        <section className="mt-16 max-w-[var(--container-prose)]">
          <div className="section-label mb-4">{"{ about }"}</div>
          <div
            className="prose-body"
            dangerouslySetInnerHTML={{ __html: renderedDescription }}
          />
        </section>

        <section className="mt-16 max-w-[var(--container-prose)]">
          <div className="section-label mb-4">{"{ reviews }"}</div>
          <ProductReviews productId={product.id} />
        </section>
      </main>
      <Footer />
    </>
  );
}
