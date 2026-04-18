import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PricingContent from "./components/pricing-content"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Dịch vụ phát triển website chuyên nghiệp với giá cả cạnh tranh.",
}

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <span className="tag mb-4 inline-block">Pricing</span>
            <h1 className="text-5xl font-bold text-white/90 mb-4">
              Bảng <span className="text-gradient">giá dịch vụ</span>
            </h1>
            <p className="text-white/40 max-w-xl leading-relaxed">
              Dịch vụ phát triển website chuyên nghiệp với giá cả cạnh tranh
            </p>
          </div>
          <PricingContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
