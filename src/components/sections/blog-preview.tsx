"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import GlassCard from "@/components/ui/glass-card"
import { blogPosts } from "@/constants"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function BlogPreview() {
  const featured = blogPosts.filter((p) => p.pinned).slice(0, 2)
  const rest = blogPosts.filter((p) => !p.pinned).slice(0, 2)
  const displayed = [...featured, ...rest].slice(0, 4)

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="tag mb-3 inline-block">Blog</span>
            <h2 className="text-4xl font-bold text-white/90">
              Latest <span className="text-gradient">articles</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm text-indigo-300/70 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
          >
            All posts
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <GlassCard className="p-6 h-full flex flex-col gap-4 group">
                  <div className="flex items-center justify-between">
                    <span className="tag">{post.category}</span>
                    {post.pinned && (
                      <span className="text-xs text-indigo-400/60">Pinned</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white/85 group-hover:text-white transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/25 pt-2 border-t border-white/5">
                    <span>{formatDate(post.date)}</span>
                    <span>·</span>
                    <span>{post.readTime} read</span>
                    <svg
                      className="ml-auto w-4 h-4 text-indigo-400/40 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1 duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
