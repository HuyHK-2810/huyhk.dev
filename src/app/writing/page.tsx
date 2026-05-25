import Link from "next/link";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getAllPosts } from "@/lib/posts";

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

export const metadata = {
  title: "Writing — huyHK",
  description:
    "Notes from 9 years of shipping software. Stories from the tester-to-fullstack journey.",
};

export default function WritingIndex() {
  const posts = getAllPosts();

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
          <div className="section-label mt-8 mb-4">{"{ writing }"}</div>
          <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-normal leading-[1.1] tracking-tight text-ink">
            Notes I&apos;m <span className="italic text-ember">working on</span>
            .
          </h1>
        </div>

        <ul className="mt-12 flex max-w-[var(--container-prose)] flex-col">
          {posts.map((post, idx) => (
            <li
              key={post.slug}
              className={idx > 0 ? "border-t border-[var(--line-soft)]" : ""}
            >
              <Link
                href={`/writing/${post.slug}`}
                className="group block py-6 transition-all duration-300 hover:pl-2"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                  <h2 className="font-serif text-[20px] font-medium leading-snug text-ink transition-colors group-hover:text-ember">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="font-mono text-[12px] text-ink-faint"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
