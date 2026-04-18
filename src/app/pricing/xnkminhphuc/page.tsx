import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import XNKMinhPhucPricingContent from "./components/xnkminhphuc-pricing-content"

export const metadata: Metadata = {
  title: "XNK Minh Phúc — Báo Giá Website",
  description:
    "Báo giá thiết kế website chuyên nghiệp cho ngành cơ khí và thiết bị xây dựng - Ưu đãi 25% cho khách hàng quen.",
}

export default function XNKMinhPhucPricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <span className="tag mb-4 inline-block">Báo giá</span>
            <h1 className="text-4xl font-bold text-white/90 mb-4">
              XNK Minh Phúc —{" "}
              <span className="text-gradient">Báo Giá Website Cơ Khí</span>
            </h1>
            <p className="text-white/40 max-w-xl leading-relaxed">
              Báo giá thiết kế website chuyên nghiệp cho ngành cơ khí và thiết bị xây dựng
            </p>
          </div>
          <XNKMinhPhucPricingContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
