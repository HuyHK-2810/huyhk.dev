import Link from "next/link";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getAllCaseStudies } from "@/lib/work";

export const metadata = {
  title: "Work — huyHK",
  description:
    "Case studies from 9 years of building software — autonomous commerce, talent acquisition, real-time UIs, payments, and the QA chair where it started.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  const items = getAllCaseStudies();
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/"
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            ← back home
          </Link>
          <div className="section-label mt-8 mb-4">{"{ work }"}</div>
          <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-normal leading-[1.1] tracking-tight text-ink">
            Five turns in <span className="italic text-ember">the road</span>.
          </h1>
          <p className="mt-5 max-w-[560px] font-serif text-[18px] font-light leading-[1.55] text-ink-soft md:text-[19px]">
            Each one taught me something I&apos;m still using. Click in for the
            story, the outcomes, and the lesson I wrote down at the time.
          </p>
        </div>

        <ol className="mt-14 flex flex-col">
          {items.map((c, idx) => (
            <li
              key={c.slug}
              className={`group grid gap-3 py-8 transition-all duration-300 hover:pl-3 md:grid-cols-[140px_1fr_24px] md:gap-8 ${
                idx > 0 ? "border-t border-[var(--line-soft)]" : ""
              }`}
            >
              <div className="font-mono text-[12px] text-ink-faint md:pt-1">
                {c.years}
              </div>

              <div>
                <Link href={`/work/${c.slug}`} className="block">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
                    {c.kind}
                  </div>
                  <h2 className="mt-2 font-serif text-[clamp(22px,2.6vw,28px)] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                    {c.name}
                  </h2>
                  <p className="mt-3 text-[16px] leading-[1.65] text-ink-soft">
                    {c.tagline}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.tags.slice(0, 6).map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[11px] text-ink-soft"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </Link>
              </div>

              <div
                aria-hidden
                className="hidden font-mono text-[18px] text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-ember md:block md:pt-3"
              >
                →
              </div>
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </>
  );
}
