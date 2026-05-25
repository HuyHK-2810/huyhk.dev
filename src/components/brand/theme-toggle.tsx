"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readCookieTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )hk_theme=(light|dark)/);
  return m ? (m[1] as Theme) : null;
}

function resolveInitialTheme(): Theme {
  const cookieValue = readCookieTheme();
  if (cookieValue) return cookieValue;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const c = document.documentElement.classList;
  if (theme === "dark") c.add("dark");
  else c.remove("dark");
  document.documentElement.style.colorScheme = theme;
  document.cookie = `hk_theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(resolveInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-ink-soft transition-colors hover:border-ember hover:text-ember"
    >
      {mounted && theme === "dark" ? (
        // Sun
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
