import Link from "next/link"
import { routes, socials, contactInfo } from "@/constants"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 mt-32">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                H
              </div>
              <span className="font-semibold text-white/90">HuyHK</span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Fullstack Developer — xây dựng sản phẩm web nhanh, ổn định và dễ bảo trì.
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">{contactInfo.availability}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Trang</h3>
            <nav className="flex flex-col gap-2.5">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                >
                  {route.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Liên hệ</h3>
            <div className="space-y-2.5">
              <a
                href={`mailto:${contactInfo.email}`}
                className="block text-sm text-white/55 hover:text-indigo-300 transition-colors duration-200"
              >
                {contactInfo.email}
              </a>
              <p className="text-sm text-white/45">{contactInfo.location}</p>
            </div>
            <div className="flex gap-3 pt-1">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/45 hover:text-white transition-colors duration-200 glass glass-hover px-3 py-1.5 rounded-lg"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {year} HuyHK. Built with Next.js 16 & React 19.
          </p>
          <p className="text-xs text-white/35">
            Designed & developed with <span className="text-indigo-400/70">♥</span> in Sài Gòn
          </p>
        </div>
      </div>
    </footer>
  )
}
