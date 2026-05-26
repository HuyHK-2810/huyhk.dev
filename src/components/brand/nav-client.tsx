"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandMark from "./brand-mark";
import ThemeToggle from "./theme-toggle";

const links = [
  { href: "/writing", label: "Writing" },
  { href: "/work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/cv", label: "CV" },
];

export default function NavClient({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const accountLabel = "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line-soft)] bg-[color-mix(in_srgb,var(--paper)_85%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-[var(--container-wide)] items-center justify-between gap-4 px-6 md:px-12">
        <Link
          href="/"
          aria-label="huyhk.dev — home"
          className="transition-transform hover:-translate-y-px"
        >
          <BrandMark size={52} />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-serif text-[15px] font-normal text-ink-soft transition-colors hover:text-ember"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {hasSession ? (
            <li>
              <Link
                href="/account"
                className="font-serif text-[15px] font-normal text-ember transition-colors hover:text-ember-deep"
              >
                {accountLabel} ↗
              </Link>
            </li>
          ) : (
            <li>
              <Link
                href="/sign-in"
                className="font-serif text-[15px] font-normal text-ink-soft transition-colors hover:text-ember"
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded border border-[var(--line)] text-ink md:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              {open ? (
                <>
                  <path d="M3 3l10 10" />
                  <path d="M13 3L3 13" />
                </>
              ) : (
                <>
                  <path d="M2 4h12" />
                  <path d="M2 8h12" />
                  <path d="M2 12h12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[var(--line-soft)] bg-paper md:hidden">
          <ul className="mx-auto flex max-w-[var(--container-wide)] flex-col gap-1 px-6 py-4 md:px-12">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-serif text-[16px] text-ink-soft hover:text-ember"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-[var(--line-soft)] pt-2">
              {hasSession ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block py-2 font-serif text-[16px] text-ember hover:text-ember-deep"
                >
                  {accountLabel} ↗
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="block py-2 font-serif text-[16px] text-ink-soft hover:text-ember"
                >
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
