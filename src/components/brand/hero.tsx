import HeroPortrait from "./hero-portrait";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 pb-20 pt-[88px] md:px-12 md:pb-28 md:pt-[104px]">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          {/* Left: copy */}
          <div className="order-2 md:order-1">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.08em] text-ember-deep">
              <span className="pulse-dot" aria-hidden />
              <span>Fullstack Engineer</span>
            </div>
            <div className="mb-8 font-mono text-[12px] tracking-[0.04em] text-ink-faint">
              currently building{" "}
              <a
                href="https://psa.team"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ember/40 underline-offset-2 hover:decoration-ember hover:text-ember"
              >
                Penguin Secret Agency
              </a>
            </div>

            <h1 className="font-serif text-[clamp(36px,5.2vw,56px)] font-normal leading-[1.05] tracking-tight text-ink">
              I started in <span className="italic text-ember">QA</span>, then I
              learned to{" "}
              <span className="whitespace-nowrap">
                <span className="underline decoration-ember decoration-[3px] underline-offset-[6px]">
                  ship
                </span>
                .
              </span>
            </h1>

            <p className="mt-6 max-w-[540px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft md:text-[19px]">
              Nine years building software. Four with a tester&apos;s eye for
              what breaks; five more learning to build the thing that
              doesn&apos;t. I make products with{" "}
              <em className="italic text-ink">
                React, Next.js, Node, and Python
              </em>{" "}
              — and I try to leave them more honest than I found them.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="/writing"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-[1px] hover:bg-ember"
              >
                Read the writing
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
              <a
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition-all hover:-translate-y-[1px] hover:border-ember hover:text-ember"
              >
                The story
              </a>
            </div>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              9 years · react · next · node · python ·{" "}
              <kbd className="rounded border border-[var(--line)] bg-paper-pure px-1.5 py-0.5 text-[11px] text-ink">
                Q
              </kbd>{" "}
              jumps to contact
            </p>
          </div>

          {/* Right: animated portrait — SVG draws first, then fades into photo */}
          <div className="order-1 md:order-2">
            <HeroPortrait />
          </div>
        </div>
      </div>
    </section>
  );
}
