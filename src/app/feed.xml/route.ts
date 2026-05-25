import { getAllPosts } from "@/lib/posts";

const BASE = "https://huyhk.dev";

function escape(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-static";

export function GET() {
  // RSS includes posts in their primary locale only — we don't want duplicate
  // entries for bilingual posts.
  const all = [...getAllPosts("en"), ...getAllPosts("vi").filter((p) => !p.availableLocales.includes("en"))];
  all.sort((a, b) => (a.date < b.date ? 1 : -1));

  const lastBuild = new Date().toUTCString();

  const items = all
    .map((p) => {
      const url = `${BASE}/writing/${p.slug}${p.locale === "vi" ? "?lang=vi" : ""}`;
      const pubDate = p.date ? new Date(p.date).toUTCString() : lastBuild;
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(p.excerpt)}</description>
      ${p.tags.map((t) => `<category>${escape(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>huyHK — writing</title>
    <link>${BASE}/writing</link>
    <description>Notes from 9 years of shipping software. Stories from the tester-to-fullstack journey.</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
