import Link from "next/link";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import ClearCartOnLoad from "@/features/cart/components/clear-cart-on-load";

export const metadata = {
  title: "Thank you — huyHK Market",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <>
      <Nav />
      <ClearCartOnLoad />
      <main className="mx-auto flex max-w-[var(--container-prose)] flex-col items-center px-6 pb-24 pt-[112px] text-center md:pt-[120px]">
        <div className="section-label mb-3">{`{ thank you }`}</div>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] tracking-tight text-ink">
          The transfer landed.
        </h1>
        <p className="mt-5 max-w-[480px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft">
          Receipt + sign-in link are on the way to your inbox. The login link
          works for 24 hours; after that, sign in normally with the email you
          used.
        </p>
        {session_id && (
          <p className="mt-4 font-mono text-[12px] text-ink-faint">
            Session: <code>{session_id.slice(0, 16)}…</code>
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/account/orders"
            className="rounded-full bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember"
          >
            View my orders
          </Link>
          <Link
            href="/market"
            className="rounded-full border border-[var(--line)] px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-ink-soft hover:border-ember hover:text-ember"
          >
            Keep browsing
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
