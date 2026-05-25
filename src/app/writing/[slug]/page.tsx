import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getAllPosts, getPostSlugs } from "@/lib/posts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPostSlugs().map((slug) => ({ slug }));
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return { title: "Not found — huyHK" };
  return {
    title: `${post.title} — huyHK`,
    description: post.excerpt,
  };
}

export default async function WritingPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) notFound();

  let Body: React.ComponentType;
  try {
    Body = (await import(`@/content/posts/${slug}.mdx`)).default;
  } catch {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
        <Link
          href="/writing"
          className="font-mono text-[13px] text-ink-faint hover:text-ember"
        >
          ← all writing
        </Link>

        <article className="mt-8">
          <div className="font-mono text-[12px] text-ember-deep">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <h1 className="mt-3 font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] tracking-tight text-ink">
            {post.title}
          </h1>

          <div className="prose-body mt-10">
            <Body />
          </div>
        </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
