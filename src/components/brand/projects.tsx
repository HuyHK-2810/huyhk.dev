import Link from "next/link";
import { getAllCaseStudies } from "@/features/work/lib/work";
import Section, { SectionHeader } from "./section";

export default function Projects() {
  const items = getAllCaseStudies();

  return (
    <Section id="projects">
      <SectionHeader
        label="projects"
        title={
          <>
            Things I&apos;ve helped{" "}
            <span className="italic text-ember">ship</span>.
          </>
        }
        lede={
          <>
            Five turns in the road. Click in for the case study, the outcomes,
            and the lessons I wrote down at the time.
          </>
        }
      />

      <ol className="mt-12 flex flex-col">
        {items.map((c, idx) => (
          <li
            key={c.slug}
            className={`reveal ${idx > 0 ? "border-t border-[var(--line-soft)]" : ""}`}
          >
            <Link
              href={`/work/${c.slug}`}
              className="group grid gap-3 py-7 transition-all duration-300 hover:pl-3 md:grid-cols-[110px_1fr_24px] md:gap-8"
            >
              <div className="font-mono text-[12px] text-ink-faint md:pt-1">
                {c.years}
              </div>

              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
                  {c.kind}
                </div>
                <h3 className="mt-1.5 font-serif text-[22px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                  {c.name}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                  {c.tagline}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.slice(0, 5).map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[11px] text-ink-soft"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-hidden
                className="hidden font-mono text-[18px] text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-ember md:block md:pt-2"
              >
                →
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-center justify-between font-mono text-[12px]">
        <Link
          href="/work"
          className="text-ink-soft transition-colors hover:text-ember"
        >
          → all case studies
        </Link>
      </div>
    </Section>
  );
}
