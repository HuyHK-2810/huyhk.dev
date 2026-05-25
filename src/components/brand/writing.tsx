import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Section, { SectionHeader } from "./section";

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

export default function Writing() {
  const posts = getAllPosts("en").slice(0, 5);

  return (
    <Section id="writing">
      <SectionHeader
        label="writing"
        title={
          <>
            Notes I&apos;m{" "}
            <span className="italic text-ember">working on</span>.
          </>
        }
        lede={
          <>
            Short pieces about real bugs, real lessons, and the quiet parts of
            shipping. No listicles.
          </>
        }
      />

      <ul className="mt-12 flex flex-col">
        {posts.map((post, idx) => (
          <li
            key={post.slug}
            className={`reveal ${idx > 0 ? "border-t border-[var(--line-soft)]" : ""}`}
          >
            <Link
              href={`/writing/${post.slug}`}
              className="group flex flex-col gap-1 py-5 transition-all duration-300 hover:pl-2 md:flex-row md:items-baseline md:justify-between md:gap-6"
            >
              <h3 className="font-serif text-[19px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 font-mono text-[12px] text-ink-faint">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between font-mono text-[12px]">
        <Link
          href="/writing"
          className="text-ink-soft transition-colors hover:text-ember"
        >
          → all writing
        </Link>
        <a
          href="/feed.xml"
          className="text-ink-faint transition-colors hover:text-ember"
        >
          RSS ↗
        </a>
      </div>
    </Section>
  );
}
