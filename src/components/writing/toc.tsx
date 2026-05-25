"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

type Props = { headings: Heading[] };

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

  if (headings.length < 3) return null;

  return (
    <nav aria-label="On this page" className="hidden xl:block">
      <div className="sticky top-[96px] max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          on this page
        </div>
        <ul className="mt-3 space-y-2 border-l border-[var(--line-soft)]">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={[
                  "block -ml-px border-l py-1 pl-3 font-mono text-[12px] leading-[1.4] transition-colors",
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
      </div>
    </nav>
  );
}
