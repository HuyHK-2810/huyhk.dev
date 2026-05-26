import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Heading = { depth: 2 | 3; text: string; id: string };

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Pulls h2/h3 from MDX body. Matches rehype-slug's behaviour for the ids. */
export function getHeadings(filename: string): Heading[] {
  const full = path.join(POSTS_DIR, filename);
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const { content } = matter(raw);

  const lines = content.split("\n");
  const headings: Heading[] = [];
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (line.trimStart().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].replace(/[*_`]/g, "").trim();
    headings.push({ depth, text, id: slugify(text) });
  }

  return headings;
}
