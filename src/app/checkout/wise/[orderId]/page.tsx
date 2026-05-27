import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getSupabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "Bank transfer — huyHK Market",
  robots: { index: false, follow: false },
};

type Params = { orderId: string };

export default async function WiseManualPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderId } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) notFound();
  const { data: order } = await supa
    .from("market_orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (!order) notFound();

  const recipientName = process.env.WISE_RECIPIENT_NAME ?? "Ho Khac Huy";
  const recipientEmail = process.env.WISE_RECIPIENT_EMAIL ?? "";
  const bankAccount = process.env.WISE_BANK_ACCOUNT ?? "";
  const bankName = process.env.WISE_BANK_NAME ?? "Wise";
  const bankSwift = process.env.WISE_BANK_SWIFT ?? "";
  const instructions = process.env.WISE_INSTRUCTIONS ?? "";

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-prose)] px-6 pb-24 pt-[112px] md:pt-[120px]">
        <div className="section-label mb-3">{`{ bank transfer }`}</div>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal leading-[1.15] tracking-tight text-ink">
          Pay via Wise.
        </h1>
        <p className="mt-4 font-serif text-[18px] font-light leading-[1.55] text-ink-soft">
          Transfer the order total to the account below. Once Huy verifies the
          incoming funds, your order is marked paid and the download link is
          emailed.
        </p>

        <dl className="mt-8 rounded-lg border border-[var(--line)] bg-paper-pure p-6 font-mono text-[13px]">
          <Row label="Order">{order.id}</Row>
          <Row label="Amount">
            {(order.total_cents / 100).toFixed(2)} {order.currency} (base)
          </Row>
          <Row label="Recipient">{recipientName}</Row>
          {recipientEmail && <Row label="Wise email">{recipientEmail}</Row>}
          {bankAccount && <Row label="Account">{bankAccount}</Row>}
          {bankName && <Row label="Bank">{bankName}</Row>}
          {bankSwift && <Row label="SWIFT">{bankSwift}</Row>}
          <Row label="Reference">{order.id.slice(0, 8)}</Row>
        </dl>

        {instructions && (
          <p className="mt-6 font-serif text-[15px] leading-[1.6] text-ink">{instructions}</p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <p className="font-mono text-[11px] text-ink-faint">
            Already transferred? Email <a href="mailto:hkhuy2810@gmail.com" className="text-ember">hkhuy2810@gmail.com</a>
            {" "}with the Wise transfer reference. Verification usually takes &lt;24h.
          </p>
          <Link
            href="/cart"
            className="self-start font-mono text-[12px] text-ink-soft hover:text-ember"
          >
            ← back to cart
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-[var(--line-soft)] py-2 last:border-b-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
