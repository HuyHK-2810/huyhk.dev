"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signUpAction } from "../lib/actions";

export default function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="flex w-full max-w-md flex-col">
        <div className="section-label mb-3">{"{ verify email }"}</div>
        <h1 className="font-serif text-[28px] font-normal leading-[1.2] tracking-tight text-ink">
          Check your inbox.
        </h1>
        <p className="mt-3 font-serif text-[17px] leading-[1.55] text-ink-soft">
          I just sent a confirmation link to the email you gave. Click it and
          you&apos;re in.
        </p>
        <p className="mt-6 font-mono text-[12px] text-ink-faint">
          Wrong address?{" "}
          <Link href="/sign-up" className="text-ember hover:underline">
            Try again
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <div className="section-label mb-3">{"{ create account }"}</div>
      <h1 className="font-serif text-[32px] font-normal leading-[1.15] tracking-tight text-ink">
        Join the list.
      </h1>
      <p className="mt-3 font-mono text-[13px] text-ink-faint">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-ember hover:underline">
          Sign in
        </Link>
        .
      </p>

      <form action={onSubmit} className="mt-8 flex flex-col gap-3">
        <label htmlFor="display_name" className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="name"
          required
          autoFocus
          disabled={pending}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />

        <label htmlFor="email" className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />

        <label htmlFor="password" className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Password <span className="text-ink-faint normal-case">(8+ chars)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account →"}
        </button>

        {error && <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>}
      </form>
    </div>
  );
}
