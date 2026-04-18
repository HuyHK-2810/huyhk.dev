import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ContactForm from "./components/contact-form"
import { contactInfo, socials } from "@/constants"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with HuyHK for collaborations, projects, or just to say hi.",
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20 relative">
        <div className="orb orb-indigo absolute top-0 left-0 w-[500px] h-[500px] opacity-10" />
        <div className="orb orb-blue absolute bottom-0 right-0 w-[400px] h-[400px] opacity-8" />

        <div className="container mx-auto px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="tag mb-4 inline-block">Contact</span>
            <h1 className="text-5xl font-bold text-white/90 mb-4">
              Let&apos;s <span className="text-gradient">work together</span>
            </h1>
            <p className="text-white/40 leading-relaxed">
              Have a project in mind? Looking for a developer to join your team? Or just want to say hi? I&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Info panel */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-semibold text-white/80 mb-4">Contact info</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-0.5">Email</p>
                        <a href={`mailto:${contactInfo.email}`} className="text-sm text-white/70 hover:text-indigo-300 transition-colors">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-0.5">Location</p>
                        <p className="text-sm text-white/70">{contactInfo.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-0.5">Status</p>
                        <p className="text-sm text-emerald-400">{contactInfo.availability}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-white/30 mb-3">Connect</p>
                  <div className="flex gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass glass-hover px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 transition-all duration-200"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <p className="text-sm text-white/40 leading-relaxed">
                  I typically respond within <strong className="text-white/60">24 hours</strong>. For urgent matters, feel free to reach out directly via email.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
