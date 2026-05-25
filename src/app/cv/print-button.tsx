"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink transition-all hover:-translate-y-px hover:border-ember hover:text-ember print:hidden"
    >
      print / save pdf
      <span aria-hidden>↓</span>
    </button>
  );
}
