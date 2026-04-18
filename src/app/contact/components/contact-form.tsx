"use client"

import { useActionState, useEffect, useRef } from "react"
import { sendContactMessage, type ContactState } from "../actions"
import Button from "@/components/ui/button"
import GlassCard from "@/components/ui/glass-card"

const initialState: ContactState = { success: false }

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  textarea,
}: {
  label: string
  name: string
  type?: string
  placeholder: string
  required?: boolean
  textarea?: boolean
}) {
  const baseClass =
    "w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/6 transition-all duration-200 resize-none"

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
        {label} {required && <span className="text-indigo-400">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={5}
          className={baseClass}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
    </div>
  )
}

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  if (state.success) {
    return (
      <GlassCard className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
        <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white/90">Message sent!</h3>
        <p className="text-white/45 text-sm max-w-xs">
          Thanks for reaching out. I&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-400/60 hover:text-indigo-400 transition-colors mt-2"
        >
          Send another message
        </button>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-7">
      <h2 className="font-semibold text-white/80 mb-6">Send a message</h2>
      <form ref={formRef} action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Name" name="name" placeholder="Your name" required />
          <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <Field label="Subject" name="subject" placeholder="What's this about?" />
        <Field label="Message" name="message" placeholder="Tell me about your project..." required textarea />

        {state.error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/8 border border-red-400/20 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {state.error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isPending}>
          {isPending ? "Sending..." : "Send message"}
          {!isPending && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </Button>
      </form>
    </GlassCard>
  )
}
