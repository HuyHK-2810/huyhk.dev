"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import GlassCard from "@/components/ui/glass-card"
import { skills } from "@/constants"

function SkillBar({ name, level, visible }: { name: string; level: number; visible: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/70">{name}</span>
        <span className="text-xs text-white/30 font-mono">{level}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ transform: visible ? `scaleX(${level / 100})` : "scaleX(0)" }}
        />
      </div>
    </div>
  )
}

export default function Skills() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 relative">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="tag mb-4 inline-block">Skills</span>
          <h2 className="text-4xl font-bold text-white/90 mb-4">
            Tech <span className="text-gradient">stack</span>
          </h2>
          <p className="text-white/40 max-w-md mx-auto">
            Technologies I work with daily to build robust and scalable applications.
          </p>
        </motion.div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            >
              <GlassCard className="p-6 h-full space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-blue-600" />
                  <h3 className="font-semibold text-white/80">{group.category}</h3>
                </div>
                <div className="space-y-4">
                  {group.items.map((skill) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      visible={visible}
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
