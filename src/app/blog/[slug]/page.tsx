import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { blogPosts } from "@/constants"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        <div className="orb orb-indigo absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10" />

        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Back */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors mb-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              All posts
            </Link>

            {/* Post header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="tag">{post.category}</span>
                {post.pinned && <span className="tag bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Featured</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white/90 leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-white/50 leading-relaxed mb-6">{post.description}</p>
              <div className="flex items-center gap-4 text-xs text-white/30">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readTime} read</span>
                <div className="ml-auto flex gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-white/20">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

            {/* Placeholder content */}
            <div className="prose-dark space-y-6">
              <p>
                This is a placeholder for the full blog post content. In a production setup, you would connect this to a CMS (like Contentlayer, MDX, or Sanity) to load the actual article content.
              </p>
              <p>
                The post <strong className="text-white/80">&quot;{post.title}&quot;</strong> would render its full content here, complete with code blocks, images, and interactive components.
              </p>
              <div className="glass rounded-xl p-5 border-l-4 border-indigo-500">
                <p className="text-white/60 text-sm">
                  <strong className="text-indigo-300">Coming soon:</strong> Connect this to your preferred content source (MDX files, Contentlayer, Sanity, or any headless CMS) to display full article content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
