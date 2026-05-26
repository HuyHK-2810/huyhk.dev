"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { signInAction, signInWithGoogle } from "../lib/actions";

export default function SignInForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signInAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    });
  }

  async function onGoogle() {
    setError(null);
    const result = await signInWithGoogle();
    if ("error" in result) {
      setError(result.error);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <div className="section-label mb-3">{"{ sign in }"}</div>
      <h1 className="font-serif text-[32px] font-normal leading-[1.15] tracking-tight text-ink">
        Welcome back.
      </h1>
      <p className="mt-3 font-mono text-[13px] text-ink-faint">
        New here?{" "}
        <Link href="/sign-up" className="text-ember hover:underline">
          Create an account
        </Link>
        .
      </p>

      <form action={onSubmit} className="mt-8 flex flex-col gap-3">
        <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          disabled={pending}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />

        <label htmlFor="password" className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in →"}
        </button>

        {error && <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>}
      </form>

      <div className="my-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        <div className="h-px flex-1 bg-[var(--line)]" />
        or
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-paper-pure px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-ember hover:text-ember disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.63z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.9-2.26c-.81.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}
