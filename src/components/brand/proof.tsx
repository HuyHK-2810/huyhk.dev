import Link from "next/link";
import { getAllPostsAsync } from "@/lib/posts-db";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function Proof() {
  const posts = await getAllPostsAsync("en");
  const latest = posts[0];
  const totalPosts = posts.length;
  const writingSince = posts.length
    ? new Date(posts[posts.length - 1].date).getFullYear()
    : new Date().getFullYear();

  return (
    <section className="border-t border-[var(--line-soft)]">
      <div className="mx-auto max-w-[var(--container-wide)] px-6 py-12 md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12">
          {latest && (
            <Link
              href={`/writing/${latest.slug}`}
              className="group relative flex flex-col gap-3 rounded-lg border border-[var(--line-soft)] bg-paper-pure p-6 transition-all hover:border-ember md:p-8"
            >
              <span className="absolute -top-2 left-6 inline-flex items-center gap-1.5 rounded-full bg-ember px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper-pure">
                <span className="pulse-dot" aria-hidden style={{ background: "white", width: 6, height: 6 }} />
                Latest
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                <time dateTime={latest.date}>{formatDate(latest.date)}</time>
                <span aria-hidden>·</span>
                <span>{latest.readingMinutes} min read</span>
              </div>
              <h3 className="font-serif text-[22px] font-medium leading-snug text-ink transition-colors group-hover:text-ember md:text-[24px]">
                {latest.title}
              </h3>
              {latest.excerpt && (
                <p className="text-[15px] leading-[1.6] text-ink-soft">
                  {latest.excerpt}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 font-mono text-[12px] text-ember-deep">
                Read the note{" "}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          )}

          <div className="flex flex-col gap-6">
            <div className="section-label">{`{ in numbers }`}</div>
            <dl className="grid grid-cols-3 gap-x-4 gap-y-6">
              <div>
                <dd className="font-serif text-[clamp(28px,3.6vw,40px)] leading-[1] tracking-tight text-ember">
                  9
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  years shipping
                </dt>
              </div>
              <div>
                <dd className="font-serif text-[clamp(28px,3.6vw,40px)] leading-[1] tracking-tight text-ember">
                  {totalPosts}
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  notes published
                </dt>
              </div>
              <div>
                <dd className="font-serif text-[clamp(28px,3.6vw,40px)] leading-[1] tracking-tight text-ember">
                  {writingSince}
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  writing since
                </dt>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-4 border-t border-[var(--line-soft)] pt-5 font-mono text-[12px] text-ink-soft">
              <a
                href="https://github.com/HuyHK-2810"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ember"
              >
                <span aria-hidden>●</span> github
              </a>
              <a
                href="https://linkedin.com/in/huyhk2810"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ember"
              >
                <span aria-hidden>●</span> linkedin
              </a>
              <a
                href="/feed.xml"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ember"
              >
                <span aria-hidden>●</span> rss
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
