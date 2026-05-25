import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
};

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts: PostMeta[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      title: String(data.title ?? file),
      date: String(data.date ?? ""),
      excerpt: data.excerpt ? String(data.excerpt) : undefined,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
