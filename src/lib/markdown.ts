import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

/** Render a markdown body to HTML using the same plugin chain we use for MDX. */
export async function renderMarkdown(body: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to section",
      },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: ["heading-anchor-icon"], ariaHidden: "true" },
        children: [{ type: "text", value: "#" }],
      },
    })
    .use(rehypeStringify)
    .process(body);
  return String(file);
}

/** Pull h2/h3 headings + slugified ids from a markdown body. */
export function extractHeadings(body: string): { depth: 2 | 3; text: string; id: string }[] {
  const headings: { depth: 2 | 3; text: string; id: string }[] = [];
  let inCode = false;
  for (const rawLine of body.split("\n")) {
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
    const id = slugify(text);
    headings.push({ depth, text, id });
  }
  return headings;
}

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

export function computeReadingStats(body: string): { wordCount: number; readingMinutes: number } {
  const words = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/[#>*_`-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    wordCount: words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}
