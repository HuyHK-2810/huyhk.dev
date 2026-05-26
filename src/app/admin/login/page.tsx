"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "invalid_password" ? "Wrong password." : "Login failed.");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="section-label mb-3">{"{ admin }"}</div>
      <h1 className="font-serif text-[32px] font-normal leading-[1.15] tracking-tight text-ink">
        Sign in.
      </h1>
      <p className="mt-3 font-mono text-[13px] text-ink-faint">
        Enter the admin password.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label htmlFor="pw" className="sr-only">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-sans text-[16px] text-ink focus:border-ember focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-md bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>
        {error && (
          <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>
        )}
      </form>
    </main>
  );
}
