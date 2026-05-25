import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import PageHeader from "@/components/brand/page-header";
import XNKMinhPhucPricingContent from "./components/xnkminhphuc-pricing-content";

export default function XNKMinhPhucPricingPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          label="xnk minh phúc"
          title="Báo giá website cơ khí"
          description="Báo giá thiết kế website chuyên nghiệp cho ngành cơ khí và thiết bị xây dựng — ưu đãi 25% cho khách hàng quen."
        />
        <div className="mx-auto max-w-[var(--container-wide)] px-6 py-16">
          <XNKMinhPhucPricingContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
