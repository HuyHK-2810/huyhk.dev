import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import GlassCard from "@/components/ui/glass-card"
import { blogPosts } from "@/constants"

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on React, Next.js, TypeScript, and modern web development.",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogPage() {
  const pinned = blogPosts.filter((p) => p.pinned)
  const rest = blogPosts.filter((p) => !p.pinned)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        {/* Orbs */}
        <div className="orb orb-indigo absolute top-0 right-0 w-[400px] h-[400px] opacity-10" />

        <div className="container mx-auto px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-16">
            <span className="tag mb-4 inline-block">Blog</span>
            <h1 className="text-5xl font-bold text-white/90 mb-4">
              Writing & <span className="text-gradient">thoughts</span>
            </h1>
            <p className="text-white/40 max-w-xl leading-relaxed">
              I write about React, Next.js, TypeScript, backend development, and everything I learn building modern web applications.
            </p>
          </div>

          {/* Pinned posts */}
          {pinned.length > 0 && (
            <section className="mb-14">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">
                Featured
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pinned.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <GlassCard className="p-6 h-full flex flex-col gap-4 group" gradient>
                      <div className="flex items-center justify-between">
                        <span className="tag">{post.category}</span>
                        <span className="text-xs text-indigo-400/50">Featured</span>
                      </div>
                      <h2 className="text-lg font-semibold text-white/85 group-hover:text-white transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-white/40 leading-relaxed flex-1">{post.description}</p>
                      <div className="flex items-center gap-3 text-xs text-white/25 pt-3 border-t border-white/5">
                        <span>{formatDate(post.date)}</span>
                        <span>·</span>
                        <span>{post.readTime} read</span>
                        <svg
                          className="ml-auto w-4 h-4 text-indigo-400/40 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1 duration-200"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All posts */}
          <section>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">
              All Articles
            </h2>
            <div className="flex flex-col gap-3">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <GlassCard className="p-5 group flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="tag">{post.category}</span>
                      </div>
                      <h3 className="font-medium text-white/80 group-hover:text-white transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-white/35 mt-1 leading-relaxed">{post.description}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <span className="text-xs text-white/25">{formatDate(post.date)}</span>
                      <span className="text-xs text-white/25">{post.readTime} read</span>
                    </div>
                    <svg
                      className="hidden sm:block w-4 h-4 text-indigo-400/30 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200 shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
