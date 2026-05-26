import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { caseStudies, getCaseStudy } from "@/features/work/lib/work";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return { title: "Not found — huyHK" };
  return {
    title: `${c.name} — huyHK work`,
    description: c.tagline,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: c.name,
      description: c.tagline,
      type: "article",
      url: `/work/${slug}`,
    },
  };
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  const idx = caseStudies.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? caseStudies[idx - 1] : null;
  const next = idx < caseStudies.length - 1 ? caseStudies[idx + 1] : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <Link
            href="/work"
            className="font-mono text-[13px] text-ink-faint hover:text-ember"
          >
            ← all work
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-ink-faint">
              <span className="text-ember-deep">{c.years}</span>
              <span aria-hidden>·</span>
              <span>{c.role}</span>
              {c.employer && (
                <>
                  <span aria-hidden>·</span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-soft underline decoration-ember/40 underline-offset-2 hover:text-ember hover:decoration-ember"
                    >
                      {c.employer} ↗
                    </a>
                  ) : (
                    <span>{c.employer}</span>
                  )}
                </>
              )}
            </div>
            <div className="section-label mt-6">{`{ ${c.kind} }`}</div>
            <h1 className="mt-2 font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] tracking-tight text-ink">
              {c.name}
            </h1>
            <p className="mt-5 font-serif text-[19px] font-light leading-[1.55] text-ink-soft">
              {c.tagline}
            </p>
          </header>

          {/* Outcomes / KPI tiles */}
          <section className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-md bg-[var(--line-soft)]">
            {c.outcomes.map((o) => (
              <div
                key={o.label}
                className="flex flex-col gap-1.5 bg-paper-pure p-5"
              >
                <div className="font-serif text-[clamp(24px,3.2vw,32px)] leading-[1] tracking-tight text-ember">
                  {o.value}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  {o.label}
                </div>
              </div>
            ))}
          </section>

          {/* Summary paragraphs */}
          <section className="prose-body mt-12 space-y-5 text-[17px] leading-[1.75] text-ink-soft">
            {c.summary.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>

          {/* Contributions */}
          <section className="mt-12">
            <div className="section-label mb-4">{"{ what I did }"}</div>
            <ul className="space-y-3">
              {c.contributions.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-[16px] leading-[1.6] text-ink"
                >
                  <span aria-hidden className="mt-1 text-ember">
                    →
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Lessons */}
          <section className="mt-12">
            <div className="section-label mb-4">{"{ lessons }"}</div>
            <ul className="space-y-4">
              {c.lessons.map((line) => (
                <li
                  key={line}
                  className="border-l-2 border-ember pl-5 font-serif text-[17px] italic leading-[1.55] text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>

          {/* Tech stack */}
          <section className="mt-12">
            <div className="section-label mb-4">{"{ stack }"}</div>
            <ul className="flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[12px] text-ink-soft"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* Related writing */}
          {c.related && c.related.length > 0 && (
            <section className="mt-12">
              <div className="section-label mb-4">{"{ further reading }"}</div>
              <ul className="space-y-2">
                {c.related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/writing/${r.slug}`}
                      className="group flex items-baseline justify-between gap-4 border-b border-[var(--line-soft)] py-3 transition-colors hover:border-ember"
                    >
                      <span className="font-serif text-[17px] text-ink transition-colors group-hover:text-ember">
                        {r.title}
                      </span>
                      <span
                        aria-hidden
                        className="font-mono text-[12px] text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ember"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prev / next */}
          {(prev || next) && (
            <nav className="mt-16 grid gap-4 border-t border-[var(--line-soft)] pt-10 sm:grid-cols-2">
              <div>
                {prev && (
                  <Link
                    href={`/work/${prev.slug}`}
                    className="group flex flex-col gap-1 rounded-md border border-[var(--line-soft)] p-4 transition-colors hover:border-ember"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                      ← Earlier work
                    </span>
                    <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                      {prev.name}
                    </span>
                  </Link>
                )}
              </div>
              <div>
                {next && (
                  <Link
                    href={`/work/${next.slug}`}
                    className="group flex flex-col items-start gap-1 rounded-md border border-[var(--line-soft)] p-4 transition-colors hover:border-ember sm:items-end sm:text-right"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                      Later work →
                    </span>
                    <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                      {next.name}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
