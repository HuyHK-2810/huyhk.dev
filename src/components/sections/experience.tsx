"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import GlassCard from "@/components/ui/glass-card"
import { experience } from "@/constants"
import { cn } from "@/lib/utils"

export default function Experience() {
  const [active, setActive] = useState(0)
  const exp = experience[active]

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-block">Kinh nghiệm</span>
          <h2 className="text-4xl font-bold text-white/90 mb-4">
            Nơi tôi đã <span className="text-gradient">làm việc</span>
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            4+ năm xây dựng sản phẩm thực tế từ startup đến enterprise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
          {/* Company tabs */}
          <div className="lg:col-span-2 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {experience.map((item, i) => (
              <button
                key={item.company}
                onClick={() => setActive(i)}
                className={cn(
                  "text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden shrink-0 lg:shrink",
                  "active:scale-95",
                  active === i
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-white shadow-glow-sm"
                    : "text-white/45 hover:text-white/75 hover:bg-white/5 border border-transparent"
                )}
              >
                {active === i && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-full" />
                )}
                <div className="pl-2">
                  <div className={cn("font-semibold transition-colors", active === i ? "text-white" : "")}>
                    {item.company}
                  </div>
                  <div className="text-xs mt-0.5 opacity-60 font-mono">{item.period}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <GlassCard className="p-6 lg:p-8 h-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{exp.role}</h3>
                      <p className="text-indigo-300/80 mt-1 font-medium">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {exp.current && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Hiện tại
                        </span>
                      )}
                      <span className="text-xs text-white/35 font-mono whitespace-nowrap">{exp.period}</span>
                    </div>
                  </div>

                  <p className="text-white/60 leading-relaxed mb-6 text-sm lg:text-base">{exp.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {exp.tech.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
