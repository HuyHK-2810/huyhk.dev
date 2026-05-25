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
  const posts = getAllPosts();

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
            <a
              href={`/writing/${post.slug}`}
              className="group flex flex-col gap-1 py-5 transition-all duration-300 hover:pl-2 md:flex-row md:items-baseline md:justify-between md:gap-6"
            >
              <h3 className="font-serif text-[19px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                {post.title}
              </h3>
              <time
                dateTime={post.date}
                className="font-mono text-[12px] text-ink-faint"
              >
                {formatDate(post.date)}
              </time>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
