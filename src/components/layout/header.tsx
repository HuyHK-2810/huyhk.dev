"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { routes } from "@/constants"

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              H
            </div>
            <span className="font-semibold text-white/90 group-hover:text-white transition-colors">
              HuyHK
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === route.href
                    ? "text-white bg-white/8"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                )}
              >
                {route.title}
                {pathname === route.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-indigo-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-glow-sm hover:shadow-glow transition-all duration-200 active:scale-95"
            >
              Hire Me
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg glass glass-hover"
              aria-label="Toggle menu"
            >
              <span className={cn("block h-0.5 w-5 bg-white/70 transition-all duration-200", menuOpen && "translate-y-2 rotate-45")} />
              <span className={cn("block h-0.5 w-5 bg-white/70 transition-all duration-200", menuOpen && "opacity-0")} />
              <span className={cn("block h-0.5 w-5 bg-white/70 transition-all duration-200", menuOpen && "-translate-y-2 -rotate-45")} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 flex flex-col gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === route.href
                    ? "text-white bg-white/8 text-indigo-300"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {route.title}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 mx-2 px-4 py-3 rounded-xl text-sm font-medium text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
            >
              Hire Me
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
