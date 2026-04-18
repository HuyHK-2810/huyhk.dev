"use client"
import { domAnimation, LazyMotion, MotionConfig } from "framer-motion"
import { ReactNode } from "react"

export default function FramerMotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
