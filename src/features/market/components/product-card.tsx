import Link from "next/link";
import type { MarketCategory, MarketProduct } from "@/lib/db/market";
import { convertPrice, formatMoney, type FxRate } from "../lib/queries";

type Props = {
  product: MarketProduct;
  category: MarketCategory;
  fxRates: FxRate[];
  displayCurrency: string;
};

export default function ProductCard({ product, category, fxRates, displayCurrency }: Props) {
  const price = convertPrice(
    product.priceCents,
    product.currency,
    displayCurrency,
    fxRates,
  );
  const compareAt = product.compareAtPriceCents
    ? convertPrice(product.compareAtPriceCents, product.currency, displayCurrency, fxRates)
    : null;

  const outOfStock = product.stockCount <= 0;

  return (
    <Link
      href={`/market/${category.slug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--line-soft)] bg-paper-pure transition-all hover:border-ember hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--ember-soft)]">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-[12px] uppercase tracking-[0.1em] text-ember-deep">
            {category.name}
          </div>
        )}
        {product.featured && (
          <div className="absolute left-3 top-3 rounded-full bg-ember px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper-pure">
            Featured
          </div>
        )}
        {outOfStock && (
          <div className="absolute right-3 top-3 rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper-pure">
            Sold out
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
            {category.name}
          </span>
        </div>
        <h3 className="font-serif text-[20px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
          {product.title}
        </h3>
        {product.shortDescription && (
          <p className="text-[14px] leading-[1.55] text-ink-soft">{product.shortDescription}</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-serif text-[20px] font-medium text-ink">{price.formatted}</span>
          {compareAt && (
            <span className="font-mono text-[12px] text-ink-faint line-through">
              {compareAt.formatted}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// keep import used
void formatMoney;
