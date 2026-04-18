import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Hero from "@/components/sections/hero"
import Skills from "@/components/sections/skills"
import Experience from "@/components/sections/experience"
import BlogPreview from "@/components/sections/blog-preview"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Skills />
        <Experience />
        <BlogPreview />
      </main>
      <Footer />
    </>
  )
}
