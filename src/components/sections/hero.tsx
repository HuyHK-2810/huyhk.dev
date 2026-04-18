"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Button from "@/components/ui/button"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 },
  }),
}

const techStack = [
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#ffffff" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Node.js", color: "#68A063" },
  { name: "PostgreSQL", color: "#336791" },
  { name: "Tailwind", color: "#38BDF8" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-indigo absolute -top-40 -left-40 w-[700px] h-[700px] animate-glow-pulse" />
      <div className="orb orb-blue absolute -bottom-40 -right-20 w-[500px] h-[500px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="orb orb-violet absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-8" />

      {/* Dot pattern */}
      <div className="bg-dots absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex items-center gap-3 mb-8"
          >
            <span className="tag">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Sẵn sàng nhận dự án mới
            </span>
            <span className="text-white/25 text-sm hidden sm:block">•</span>
            <span className="text-white/40 text-sm hidden sm:block">Ho Chi Minh City, VN</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]"
          >
            <span className="text-white/90">Tôi biến</span>{" "}
            <span className="text-gradient">ý tưởng</span>
            <br className="hidden sm:block" />
            <span className="text-white/90"> thành sản phẩm</span>{" "}
            <span className="text-gradient">thực tế</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-lg text-white/65 max-w-2xl mb-4 leading-relaxed"
          >
            Xin chào, tôi là <strong className="text-white/90 font-semibold">HuyHK</strong> — Fullstack Developer với 4+ năm kinh nghiệm. Tôi không chỉ viết code, tôi xây dựng hệ thống hoạt động thực sự: nhanh, ổn định và dễ bảo trì.
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="text-base text-white/45 max-w-xl mb-10 leading-relaxed"
          >
            Đã qua tay <strong className="text-white/65">REMOLUTION, NASHPUSH, ALMAPAY, FPT SOFTWARE</strong> — mỗi nơi đều để lại thứ gì đó chạy production.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
          >
            <Link href="/projects">
              <Button size="lg">
                Xem portfolio
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Liên hệ hợp tác
              </Button>
            </Link>
          </motion.div>

          {/* Tech stack */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Stack chính</p>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="glass glass-hover px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white/90 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tech.color, boxShadow: `0 0 6px ${tech.color}60` }} />
                  {tech.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="absolute bottom-12 right-8 hidden lg:flex flex-col gap-6"
        >
          {[
            { value: "4+", label: "Năm kinh nghiệm" },
            { value: "10+", label: "Dự án thực tế" },
            { value: "4", label: "Công ty đã qua" },
          ].map((stat) => (
            <div key={stat.label} className="text-right">
              <div className="text-2xl font-bold text-gradient-primary">{stat.value}</div>
              <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/20">scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  )
}
