#!/usr/bin/env node
/**
 * Reference implementation for AI agents posting drafts to huyhk.dev.
 *
 * Read AI_PUBLISHING.md before adapting. Defaults to status="draft" so a
 * human can review before publishing.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ai-publish.mjs ./drafts/my-post.json
 *
 * Or programmatically:
 *   import { publish } from './scripts/ai-publish.mjs';
 *   await publish({ title: ..., body: ..., ... });
 */

import fs from "node:fs";
import path from "node:path";

// NOTE: env vars are read inside publish() / the CLI block — NOT at module
// load — so that other scripts (e.g. daily-publish.mjs) can import { validate }
// without needing ADMIN_TOKEN at import time.
const SITE = process.env.AI_PUBLISH_SITE ?? "http://localhost:3000";

const ALLOWED_TAGS = new Set([
  "career", "testing", "fullstack", "frontend", "react", "nextjs", "node",
  "python", "typescript", "postgres", "auth", "agents", "process",
  "lessons", "tools",
]);

const ALLOWED_LOCALES = new Set(["en", "vi"]);
const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

/**
 * Editorial validation — mirrors Section 9 of AI_PUBLISHING.md.
 * Returns array of problem strings. Empty = ok.
 */
export function validate(post) {
  const errs = [];

  const titleWords = (post.title ?? "").trim().split(/\s+/).filter(Boolean).length;
  if (titleWords < 6 || titleWords > 12) {
    errs.push(`Title must be 6–12 words (got ${titleWords}).`);
  }

  if (/\b(top|best)\s+\d+|^\d+\s+(ways|tips|reasons)/i.test(post.title ?? "")) {
    errs.push("Title looks like a listicle — rewrite as a declarative statement with tension.");
  }

  const excerpt = (post.excerpt ?? "").trim();
  if (!excerpt) errs.push("Missing excerpt.");
  else if (excerpt.length > 200) errs.push(`Excerpt > 200 chars (got ${excerpt.length}).`);

  const body = post.body ?? "";
  const wordCount = body
    .replace(/```[\s\S]*?```/g, "")
    .split(/\s+/).filter(Boolean).length;
  if (wordCount < 800) {
    errs.push(`Body is ${wordCount} words — minimum 800 for a real post.`);
  }

  const headings = [...body.matchAll(/^(#{2,3})\s+(.+)$/gm)];
  if (headings.length < 3) {
    errs.push(`Only ${headings.length} h2/h3 headings — need at least 3 sections.`);
  }
  for (const [, , text] of headings) {
    if (/^(introduction|conclusion|background|summary|overview)$/i.test(text.trim())) {
      errs.push(`Generic heading "${text.trim()}" — rewrite with the specific point.`);
    }
  }

  const locale = post.locale ?? "en";
  if (!ALLOWED_LOCALES.has(locale)) errs.push(`Invalid locale "${locale}".`);

  const status = post.status ?? "draft";
  if (!ALLOWED_STATUS.has(status)) errs.push(`Invalid status "${status}".`);
  if (status === "published") {
    errs.push("Refusing to publish directly. Set status='draft' for human review.");
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  if (tags.length < 2 || tags.length > 5) {
    errs.push(`Tags must be 2–5 (got ${tags.length}).`);
  }
  for (const t of tags) {
    if (!ALLOWED_TAGS.has(t)) {
      errs.push(`Tag "${t}" not in taxonomy — see AI_PUBLISHING.md §5.`);
    }
  }

  // Anti-pattern sniffs
  const banned = [
    [/\bAs developers,? we\b/i, "Uses 'as developers, we…' — Huy writes 'I'."],
    [/\bIn today's fast-paced world\b/i, "SEO-bait opener."],
    [/\bAs we all know\b/i, "Assumes shared frame; rewrite."],
    [/\bleverage\b|\butilize\b|\bsynergize\b/i, "Corporate verbs detected."],
    [/^\s*(?:#{2,3})\s+\d+[\.\)]\s+\w/m, "Numbered list as headings — restructure to prose."],
  ];
  for (const [re, msg] of banned) {
    if (re.test(body)) errs.push(msg);
  }

  return errs;
}

export async function publish(post) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    throw new Error("Missing ADMIN_TOKEN env. Set in .env.local or shell.");
  }

  const problems = validate(post);
  if (problems.length > 0) {
    console.error("Validation failed:");
    for (const p of problems) console.error("  ×", p);
    throw new Error("Post failed editorial validation.");
  }

  const res = await fetch(`${SITE}/api/admin/posts`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: post.title,
      slug: post.slug,
      locale: post.locale ?? "en",
      excerpt: post.excerpt,
      tags: post.tags,
      body: post.body,
      status: "draft",  // hardcoded: human approves via /admin
      date: post.date ?? new Date().toISOString(),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`POST failed (${res.status}): ${json.error ?? "unknown"}`);
  }

  console.log("✓ Draft created.");
  console.log(`  id: ${json.post?.id}`);
  console.log(`  slug: ${json.post?.slug}`);
  console.log(`  review at: ${SITE}/admin/posts/${json.post?.id}`);
  return json.post;
}

// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/ai-publish.mjs <draft.json>");
    process.exit(1);
  }
  const draft = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  try {
    await publish(draft);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
