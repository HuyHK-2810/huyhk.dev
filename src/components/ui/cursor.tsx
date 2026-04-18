"use client"

import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let raf: number

    const move = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    }

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.12
      cursorY += (mouseY - cursorY) * 0.12
      cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`
      raf = requestAnimationFrame(animate)
    }

    const onEnterInteractive = () => cursor.classList.add("scale-150", "opacity-50")
    const onLeaveInteractive = () => cursor.classList.remove("scale-150", "opacity-50")

    const interactives = document.querySelectorAll(
      "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']"
    )
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive)
      el.addEventListener("mouseleave", onLeaveInteractive)
    })

    window.addEventListener("mousemove", move, { passive: true })
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", move)
      cancelAnimationFrame(raf)
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive)
        el.removeEventListener("mouseleave", onLeaveInteractive)
      })
    }
  }, [])

  return (
    <>
      {/* Trailing circle */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-10 w-10 rounded-full border border-indigo-400/40 bg-indigo-500/5 backdrop-blur-sm transition-[transform,opacity] duration-150 ease-out will-change-transform"
        style={{ transition: "transform 0s, opacity 0.2s, scale 0.2s" }}
        aria-hidden
      />
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-indigo-400 will-change-transform"
        aria-hidden
      />
    </>
  )
}
