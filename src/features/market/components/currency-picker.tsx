"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "hk_currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Detect a sensible default currency from Accept-Language / locale. */
function detectDefault(): string {
  if (typeof navigator === "undefined") return "USD";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("vi")) return "VND";
  if (lang.startsWith("ja")) return "JPY";
  if (lang === "en-gb" || lang.startsWith("en-uk")) return "GBP";
  if (lang.startsWith("de") || lang.startsWith("fr") || lang.startsWith("es") || lang.startsWith("it")) return "EUR";
  return "USD";
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )hk_currency=([A-Z]{3})/);
  return m ? m[1] : null;
}

function writeCookie(currency: string) {
  document.cookie = `${COOKIE_NAME}=${currency}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

const CURRENCIES = ["USD", "VND", "EUR", "GBP", "JPY"];

export default function CurrencyPicker() {
  const [currency, setCurrency] = useState("USD");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrency(readCookie() ?? detectDefault());
    setMounted(true);
  }, []);

  function onChange(next: string) {
    setCurrency(next);
    writeCookie(next);
    // Hard reload so the SSR prices regenerate with the new currency.
    window.location.reload();
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-paper-pure px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em]">
      <span className="text-ink-faint">$</span>
      <select
        value={mounted ? currency : "USD"}
        onChange={(e) => onChange(e.target.value)}
        suppressHydrationWarning
        className="cursor-pointer border-0 bg-transparent text-ink focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
