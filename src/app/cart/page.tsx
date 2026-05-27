import { cookies } from "next/headers";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import CartPageClient from "@/features/cart/components/cart-page-client";
import { getFxRates } from "@/features/market/lib/queries";

export const metadata = {
  title: "Cart — huyHK Market",
  robots: { index: false, follow: false },
};

async function resolveDisplayCurrency(): Promise<string> {
  const store = await cookies();
  const c = store.get("hk_currency")?.value;
  if (c && /^[A-Z]{3}$/.test(c)) return c;
  return "USD";
}

export default async function CartPage() {
  const [fxRates, displayCurrency] = await Promise.all([getFxRates(), resolveDisplayCurrency()]);
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <div className="section-label mb-3">{`{ cart }`}</div>
          <h1 className="font-serif text-[clamp(32px,5vw,44px)] font-normal leading-[1.15] tracking-tight text-ink">
            Almost there.
          </h1>
        </div>
        <div className="mt-10">
          <CartPageClient fxRates={fxRates} displayCurrency={displayCurrency} />
        </div>
      </main>
      <Footer />
    </>
  );
}
