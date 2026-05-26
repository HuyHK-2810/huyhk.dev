import Section, { SectionHeader } from "./section";

type Service = {
  name: string;
  pitch: React.ReactNode;
  deliverables: string[];
  timeline: string;
  startingAt?: string;
};

const services: Service[] = [
  {
    name: "Landing page builds",
    pitch: (
      <>
        High-converting landing pages — Next.js, Tailwind, fast, SEO-clean,
        deploy-ready on Vercel. From copy to launch in days, not months.
      </>
    ),
    deliverables: [
      "Custom design, no template",
      "Mobile-first, 90+ Lighthouse",
      "Analytics, OG, sitemap wired",
      "1 round of revisions",
    ],
    timeline: "5–10 days",
    startingAt: "from $600",
  },
  {
    name: "Fullstack feature work",
    pitch: (
      <>
        Drop me into your React/Next.js + Node/Python stack. Ship the feature,
        debug the queue job, fix the OAuth/SSO flow that's bleeding revenue.
        9 years on call.
      </>
    ),
    deliverables: [
      "Feature design + implementation",
      "Test plan & rollback path",
      "PR with reviewable diffs",
      "Knowledge handoff document",
    ],
    timeline: "1–3 weeks",
    startingAt: "from $1,500",
  },
  {
    name: "Code & product audit",
    pitch: (
      <>
        I read your code like a tester reads a build. You get a written report
        on the bugs about to bite you, the perf wins on the table, and the
        bottlenecks blocking your team's shipping cadence.
      </>
    ),
    deliverables: [
      "Codebase walkthrough",
      "Written audit report",
      "Prioritized fix list",
      "60-min review call",
    ],
    timeline: "3–5 days",
    startingAt: "from $400",
  },
];

export default function Services() {
  return (
    <Section id="services" bleed>
      <SectionHeader
        label="available for work"
        title={
          <>
            Things I can{" "}
            <span className="italic text-ember">build for you</span>.
          </>
        }
        lede={
          <>
            I take on a small number of client projects each quarter. If your
            stack overlaps with mine and the work is interesting, I&apos;d love
            to hear about it.
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-[var(--line-soft)] md:grid-cols-3">
        {services.map((s, idx) => (
          <article
            key={s.name}
            className="reveal flex flex-col gap-4 bg-paper-pure p-6 transition-colors duration-300 hover:bg-ember-soft md:p-7"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[12px] text-ember-deep">
                {String(idx + 1).padStart(2, "0")}
              </span>
              {s.startingAt && (
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                  {s.startingAt}
                </span>
              )}
            </div>

            <h3 className="font-serif text-[22px] font-medium leading-snug text-ink">
              {s.name}
            </h3>

            <p className="text-[15px] leading-[1.6] text-ink-soft">{s.pitch}</p>

            <ul className="mt-1 space-y-1.5 text-[14px] text-ink-soft">
              {s.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 text-ember">
                    ✓
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--line-soft)] pt-4 font-mono text-[12px]">
              <span className="text-ink-faint">timeline</span>
              <span className="text-ink">{s.timeline}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-[var(--container-prose)] flex-col items-center gap-3 text-center">
        <p className="font-serif text-[17px] italic leading-[1.55] text-ink-soft">
          Not sure which one fits? Tell me about the problem, I&apos;ll tell
          you which shape it is.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:hkhuy2810@gmail.com?subject=Project%20enquiry"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember"
          >
            Email me <span aria-hidden>→</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition-all hover:-translate-y-px hover:border-ember hover:text-ember"
          >
            Other channels
          </a>
        </div>
      </div>
    </Section>
  );
}
