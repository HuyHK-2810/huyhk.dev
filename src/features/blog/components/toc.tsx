"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/features/blog/lib/toc";

type Props = { headings: Heading[] };

/**
 * Sticky in-article TOC. Renders on lg+ screens (≥1024px). Tracks the
 * currently in-view heading via IntersectionObserver and highlights it.
 *
 * Layout note: the *parent* must own the sticky positioning context. We use
 * `sticky top-[88px]` here (72px nav + 16px breathing). The grid column in
 * `writing/[slug]/page.tsx` is the containing block and has `align-self:
 * start` so this element doesn't get stretched.
 */
export default function TableOfContents({ headings }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="fixed top-[140px] self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        on this page
      </div>
      <ul className="mt-3 space-y-1 border-l border-[var(--line-soft)]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={[
                "block -ml-px border-l py-1.5 pl-3 font-mono text-[12px] leading-[1.45] transition-colors",
                h.depth === 3 ? "pl-6" : "",
                active === h.id
                  ? "border-ember text-ember"
                  : "border-transparent text-ink-faint hover:text-ink",
              ].join(" ")}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
