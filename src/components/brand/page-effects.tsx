"use client";

import { useEffect } from "react";

export default function PageEffects() {
  // Scroll-reveal: add `visible` to any `.reveal` element as it enters viewport.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("visible"));
      return;
    }

    // Arm the reveal animation only now (prevents hidden content for non-JS users).
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  // Keyboard shortcut: press `Q` (when not inside an input) to jump to contact.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "q" && e.key !== "Q") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const contact = document.getElementById("contact");
      if (contact) {
        e.preventDefault();
        contact.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
