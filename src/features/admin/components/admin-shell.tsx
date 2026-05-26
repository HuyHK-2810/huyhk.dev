"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navLinks = [
    { href: "/admin", label: "Posts" },
    { href: "/admin/new", label: "New" },
  ];

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link
            href="/admin"
            className="font-mono text-[13px] uppercase tracking-[0.08em] text-ember-deep"
          >
            {"{ admin }"}
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "rounded-md px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors",
                    active
                      ? "bg-ember text-paper-pure"
                      : "text-ink-soft hover:text-ember",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-faint hover:text-ember"
            >
              ↗ site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-soft transition-colors hover:border-ember hover:text-ember"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-6 py-10">{children}</main>
    </div>
  );
}
