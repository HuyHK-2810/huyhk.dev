// One-shot: import every src/content/posts/*.mdx into the Supabase posts table.
// Idempotent: re-running upserts by (slug, locale).
//
// Usage:
//   node --env-file=.env.local scripts/migrate-mdx.mjs
//
// Notes:
//   - <Callout type="X" title="Y">…</Callout> JSX is rewritten as a markdown
//     blockquote with a bold label, so DB-sourced posts can render through the
//     pure-markdown pipeline.
//   - Other JSX is left intact; rehype-raw on the read side will keep simple
//     tags but anything React-specific (props, fragments) will fail. None of
//     the current posts use that, so we keep the converter focused.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. " +
      "Did you run with `node --env-file=.env.local`?",
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseFilename(filename) {
  if (!filename.endsWith(".mdx")) return null;
  const base = filename.replace(/\.mdx$/, "");
  const m = base.match(/^(.+)\.(en|vi)$/);
  return m ? { slug: m[1], locale: m[2] } : { slug: base, locale: "en" };
}

const CALLOUT_LABELS = {
  note: "Note",
  warn: "Heads up",
  tip: "Tip",
  quote: "Story",
};

function transformCallouts(body) {
  return body.replace(
    /<Callout(?:\s+type="(\w+)")?(?:\s+title="([^"]+)")?\s*>([\s\S]*?)<\/Callout>/g,
    (_, type, title, content) => {
      const label = title ?? CALLOUT_LABELS[type ?? "note"] ?? "Note";
      const trimmed = content.trim();
      const quoted = trimmed
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return `> **${label}**\n>\n${quoted}`;
    },
  );
}

function computeReadingStats(body) {
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

async function run() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  if (files.length === 0) {
    console.log("No .mdx files found.");
    return;
  }

  console.log(`Found ${files.length} MDX files\n`);

  let ok = 0;
  let failed = 0;

  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) continue;

    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (!data.title) {
      console.log(`× ${file}: missing title in frontmatter, skipping`);
      failed++;
      continue;
    }

    const body = transformCallouts(content).trim();
    const stats = computeReadingStats(body);

    const dateRaw = data.date ?? new Date().toISOString();
    const publishedAt = new Date(dateRaw).toISOString();

    const row = {
      slug: parsed.slug,
      locale: parsed.locale,
      title: String(data.title),
      excerpt: data.excerpt ? String(data.excerpt) : null,
      body,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      status: "published",
      date: publishedAt,
      published_at: publishedAt,
      word_count: stats.wordCount,
      reading_minutes: stats.readingMinutes,
    };

    const { error } = await supabase
      .from("posts")
      .upsert(row, { onConflict: "slug,locale" });

    if (error) {
      console.log(`× ${parsed.slug} (${parsed.locale}): ${error.message}`);
      failed++;
    } else {
      console.log(
        `✓ ${parsed.slug} (${parsed.locale}) — ${stats.wordCount} words, ${stats.readingMinutes} min`,
      );
      ok++;
    }
  }

  console.log(`\nDone: ${ok} upserted, ${failed} failed.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
