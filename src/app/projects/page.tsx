import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import GlassCard from "@/components/ui/glass-card"
import { projects } from "@/constants"

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of my web development projects — from fullstack apps to open source.",
}

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20 relative">
        <div className="orb orb-blue absolute top-0 right-0 w-[500px] h-[500px] opacity-10" />
        <div className="orb orb-violet absolute bottom-20 left-0 w-[400px] h-[400px] opacity-8" />

        <div className="container mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <span className="tag mb-4 inline-block">Portfolio</span>
            <h1 className="text-5xl font-bold text-white/90 mb-4">
              Selected <span className="text-gradient">projects</span>
            </h1>
            <p className="text-white/40 max-w-xl leading-relaxed">
              A collection of projects I&apos;ve built — ranging from client websites to internal tools. Each one focused on performance, maintainability, and great UX.
            </p>
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <section className="mb-14">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((project) => (
                  <Link
                    key={project.title}
                    href={project.href}
                    className={project.href === "#" ? "pointer-events-none" : ""}
                  >
                    <GlassCard className="p-7 h-full flex flex-col gap-5 group" gradient>
                      <div className="flex items-center justify-between">
                        <span className={`tag ${project.status === "Live" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : ""}`}>
                          {project.status === "Live" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                          )}
                          {project.status}
                        </span>
                        <svg
                          className="w-4 h-4 text-indigo-400/30 group-hover:text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white/85 group-hover:text-white transition-colors mb-3">
                          {project.title}
                        </h2>
                        <p className="text-sm text-white/45 leading-relaxed">{project.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                        {project.tech.map((t) => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Other projects */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Other Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rest.map((project) => (
                  <GlassCard key={project.title} className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-white/75">{project.title}</h3>
                      <span className="tag text-xs shrink-0 ml-2">{project.status}</span>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                      {project.tech.map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
