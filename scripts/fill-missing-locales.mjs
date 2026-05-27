#!/usr/bin/env node
/**
 * Fill missing locale counterparts.
 *
 * For each published post that exists in only one locale, translate it into
 * the missing locale (preserving slug + tags) and POST as a draft. Designed
 * to be re-runnable — already-bilingual posts are skipped.
 *
 * Uses the `claude` CLI (Claude Code subscription, no API key).
 *
 * Usage:
 *   node --env-file=.env.local scripts/fill-missing-locales.mjs [--dry-run] [--slug=<slug>] [--target=en|vi]
 *
 * --target=en  only fill EN-missing posts (i.e. VI-only → add EN)
 * --target=vi  only fill VI-missing posts (i.e. EN-only → add VI)
 * (omitted)    fill both directions
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { validate } from "./ai-publish.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const targetFilter = args.find((a) => a.startsWith("--target="))?.split("=")[1];
const verbose = args.includes("--verbose");

const SITE = process.env.AI_PUBLISH_SITE ?? "https://www.huyhk.dev";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN) {
  console.error("Missing ADMIN_TOKEN env var.");
  process.exit(1);
}

const RULES = fs.readFileSync(
  path.join(process.cwd(), "AI_PUBLISHING.md"),
  "utf8",
);

const POST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    locale: { type: "string", enum: ["en", "vi"] },
    excerpt: { type: "string" },
    tags: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "career", "testing", "fullstack", "frontend", "react", "nextjs",
          "node", "python", "typescript", "postgres", "auth", "agents",
          "process", "lessons", "tools",
        ],
      },
    },
    body: { type: "string" },
  },
  required: ["title", "slug", "locale", "excerpt", "tags", "body"],
};

// ─────────────────────────────────────────────────────────────────

async function listPublished() {
  const res = await fetch(
    `${SITE}/api/admin/posts?fields=id,slug,title,locale,tags&status=published`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } },
  );
  if (!res.ok) throw new Error(`list failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.posts ?? [];
}

async function fetchFullPost(id) {
  const res = await fetch(`${SITE}/api/admin/posts/${id}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  if (!res.ok) throw new Error(`fetch ${id} failed (${res.status})`);
  return (await res.json()).post;
}

function buildTranslationPrompt(source, targetLocale) {
  return `Translate the blog post below from ${source.locale.toUpperCase()} to ${targetLocale.toUpperCase()} for the same blog (huyhk.dev), keeping it native — DO NOT transliterate.

Hard constraints:
1. Keep the SAME slug exactly: ${source.slug}
2. Keep the SAME tags exactly: ${JSON.stringify(source.tags)}
3. locale must be "${targetLocale}"
4. Preserve the central thesis, all anecdotes, the year/place references.
5. Preserve the H2 section structure (same number of sections, same beats — translate the headings).
6. Preserve any callouts (\`> **Label**\\n>\\n> body\`), \`*italicized lessons*\`, and code blocks. Translate prose inside callouts but keep code verbatim.
7. Title must feel native ${targetLocale === "vi" ? "Vietnamese (no clunky translation)" : "English"} — 6–12 words, declarative, has tension.
8. Excerpt: 1–2 sentences, ≤ 200 chars, native in target language.
9. Length: 800–1500 words after translation.
10. Voice: first-person, observed; no listicles, no "as developers we", no SEO-bait.

${targetLocale === "vi"
  ? "For Vietnamese: use Huy's natural cadence — short sentences, em-dash asides. Tech terms (React, Next.js, OAuth, queue, middleware) stay in English. Use 'tôi' not 'mình'. Match the existing flagship vi posts (tester-dna.vi, oauth-sso-warning.vi) in tone."
  : "For English: match the voice in the flagship en posts."}

SOURCE POST (locale=${source.locale}):
\`\`\`md
TITLE: ${source.title}
EXCERPT: ${source.excerpt}

${source.body}
\`\`\`

Output ONLY a JSON object matching the response schema. No prose, no markdown wrapper.`;
}

function runClaude(userPrompt) {
  return new Promise((resolve, reject) => {
    const claudeArgs = [
      "--print",
      "--output-format", "json",
      "--json-schema", JSON.stringify(POST_SCHEMA),
      "--append-system-prompt", RULES,
      "--model", "opus",
      "--effort", "high",
      "--no-session-persistence",
      "--disable-slash-commands",
      userPrompt,
    ];
    const child = spawn("claude", claudeArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let lastDot = Date.now();
    child.stdout.on("data", (c) => {
      stdout += c.toString();
      if (Date.now() - lastDot > 2000) {
        process.stderr.write(".");
        lastDot = Date.now();
      }
    });
    child.stderr.on("data", (c) => {
      stderr += c.toString();
      if (verbose) process.stderr.write(c.toString());
    });
    child.on("error", reject);
    child.on("close", (code) => {
      process.stderr.write("\n");
      if (code !== 0) {
        return reject(new Error(`claude exited ${code}: ${stderr.slice(0, 500)}`));
      }
      let envelope;
      try {
        envelope = JSON.parse(stdout);
      } catch (err) {
        return reject(
          new Error(`Non-JSON: ${err.message}\n${stdout.slice(0, 500)}`),
        );
      }
      let draft = envelope.structured_output;
      if (!draft && typeof envelope.result === "string" && envelope.result.trim().startsWith("{")) {
        try { draft = JSON.parse(envelope.result); } catch (e) { void e; }
      }
      if (!draft) {
        return reject(
          new Error(
            `Missing structured_output. is_error=${envelope.is_error}, stop=${envelope.stop_reason}`,
          ),
        );
      }
      resolve({ draft, envelope });
    });
  });
}

async function postDraft(post) {
  const res = await fetch(`${SITE}/api/admin/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...post, status: "draft" }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST failed (${res.status}): ${json.error ?? "unknown"}`);
  return json.post;
}

// ─────────────────────────────────────────────────────────────────

async function main() {
  console.error(`[scan] Listing published posts from ${SITE} …`);
  const all = await listPublished();

  // Group by slug to find missing locales.
  const bySlug = new Map();
  for (const p of all) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, new Set());
    bySlug.get(p.slug).add(p.locale);
  }

  const gaps = [];
  for (const [slug, locales] of bySlug) {
    if (onlySlug && slug !== onlySlug) continue;
    const has = (l) => locales.has(l);
    if (!has("en") && (!targetFilter || targetFilter === "en")) {
      const src = all.find((p) => p.slug === slug && p.locale === "vi");
      if (src) gaps.push({ source: src, target: "en" });
    }
    if (!has("vi") && (!targetFilter || targetFilter === "vi")) {
      const src = all.find((p) => p.slug === slug && p.locale === "en");
      if (src) gaps.push({ source: src, target: "vi" });
    }
  }

  if (gaps.length === 0) {
    console.error("All published posts are bilingual ✓");
    return;
  }

  console.error(`[scan] ${gaps.length} gap(s) to fill:`);
  for (const g of gaps) {
    console.error(`  ${g.source.slug}: ${g.source.locale} → ${g.target}`);
  }

  let ok = 0;
  let failed = 0;
  for (const { source, target } of gaps) {
    console.error(`\n──── ${source.slug} → ${target.toUpperCase()} ────`);
    let full;
    try {
      full = await fetchFullPost(source.id);
    } catch (err) {
      console.error(`× fetch ${source.slug} failed:`, err.message);
      failed++;
      continue;
    }

    let result;
    try {
      result = await runClaude(buildTranslationPrompt(full, target));
    } catch (err) {
      console.error(`× claude failed for ${source.slug}:`, err.message);
      failed++;
      continue;
    }
    const { draft, envelope } = result;
    console.error(
      `[claude] duration=${envelope.duration_ms ?? "?"}ms cost=${envelope.total_cost_usd != null ? "$" + envelope.total_cost_usd.toFixed(4) : "(subscription)"}`,
    );

    // Enforce sameness regardless of model deviation
    draft.slug = full.slug;
    draft.tags = full.tags;
    draft.locale = target;

    const wordCount = (draft.body ?? "").split(/\s+/).filter(Boolean).length;
    console.error(`[words] ${wordCount}`);

    const problems = validate(draft);
    if (problems.length > 0) {
      console.error("Validation issues:");
      for (const p of problems) console.error("  ×", p);
      if (!dryRun) {
        console.error("Skipping POST.");
        failed++;
        continue;
      }
    } else {
      console.error("[validate] ✓");
    }

    if (dryRun) {
      console.log("--- DRY RUN — would POST ---");
      console.log(JSON.stringify(draft, null, 2).slice(0, 500) + "…");
      continue;
    }

    try {
      const posted = await postDraft(draft);
      console.error(`✓ Draft created: ${posted.id} (${posted.slug}/${posted.locale})`);
      console.error(`  review: ${SITE}/admin/posts/${posted.id}`);
      ok++;
    } catch (err) {
      console.error(`× POST failed:`, err.message);
      failed++;
    }
  }

  console.error(`\n[done] ${ok} created, ${failed} failed.`);
}

main().catch((err) => {
  console.error("FATAL:", err.message ?? err);
  process.exit(1);
});
