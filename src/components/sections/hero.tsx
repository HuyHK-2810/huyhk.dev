"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Button from "@/components/ui/button"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-indigo absolute -top-40 -left-40 w-[600px] h-[600px] animate-glow-pulse" />
      <div className="orb orb-blue absolute -bottom-40 -right-20 w-[500px] h-[500px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="orb orb-violet absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-5" />

      {/* Dot pattern */}
      <div className="bg-dots absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="tag">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Available for work
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-white/90">Building</span>{" "}
            <span className="text-gradient">modern web</span>
            <br />
            <span className="text-white/90">experiences</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            I&apos;m <strong className="text-white/80 font-medium">HuyHK</strong>, a Fullstack Developer specializing in React, Next.js, and Node.js. I craft seamless, optimized, and scalable web applications that make a real impact.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/projects">
              <Button size="lg">
                View my work
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Get in touch
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "4+", label: "Years exp." },
              { value: "10+", label: "Projects" },
              { value: "4", label: "Companies" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white/90 text-gradient-primary">{stat.value}</div>
                <div className="text-xs text-white/35 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/25">Scroll</span>
        <div className="h-8 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  )
}
