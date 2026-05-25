import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import PageHeader from "@/components/brand/page-header";
import PricingContent from "./components/pricing-content";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          label="pricing"
          title="Pricing"
          description="Dịch vụ phát triển website chuyên nghiệp với giá cả cạnh tranh."
        />
        <div className="mx-auto max-w-[var(--container-wide)] px-6 py-16">
          <PricingContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
