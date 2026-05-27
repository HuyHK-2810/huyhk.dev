#!/usr/bin/env node
/**
 * daily-publish-cli.mjs — local cron entry-point that uses your **Claude Code
 * subscription** (no ANTHROPIC_API_KEY required).
 *
 * Shells out to the `claude` CLI in --print mode with --json-schema for
 * structured output. Auth comes from your Claude Code OAuth session (the same
 * one you use when running `claude` interactively), so usage counts against
 * your Claude Code Pro/Max plan, not API credits.
 *
 * Trade-off vs daily-publish.mjs:
 *   + No API key, no per-token billing
 *   + Same model (opus 4.7)
 *   − No fine-grained streaming hook
 *   − Subscription rate-limited (will reject if you hit Claude Code quotas)
 *   − Requires `claude` binary on PATH
 *
 * Usage:
 *   node --env-file=.env.local scripts/daily-publish-cli.mjs [--locale=en|vi] [--dry-run]
 *
 * Cron (daily 09:00):
 *   0 9 * * * cd /Users/huyhk/dev/huyhk2810/huyhk.dev && \
 *     /usr/local/bin/node --env-file=.env.local scripts/daily-publish-cli.mjs \
 *     >> /tmp/huyhk-publish.log 2>&1
 *
 * Required env (in .env.local):
 *   ADMIN_TOKEN=...
 *   AI_PUBLISH_SITE=http://localhost:3000
 * Required on PATH:
 *   claude (Claude Code CLI, OAuth-authenticated via `claude` interactive run once)
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { validate } from "./ai-publish.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// Args + env
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const localeArg = args.find((a) => a.startsWith("--locale="))?.split("=")[1];
const verbose = args.includes("--verbose");

const SITE = process.env.AI_PUBLISH_SITE ?? "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("Missing ADMIN_TOKEN env var.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Read the rule book once. Will be passed via --append-system-prompt.
// ─────────────────────────────────────────────────────────────────────────────

const RULES_PATH = path.join(process.cwd(), "AI_PUBLISHING.md");
if (!fs.existsSync(RULES_PATH)) {
  console.error(`AI_PUBLISHING.md not found at ${RULES_PATH}`);
  process.exit(1);
}
const RULES = fs.readFileSync(RULES_PATH, "utf8");

// ─────────────────────────────────────────────────────────────────────────────
// Existing posts (sparse fields)
// ─────────────────────────────────────────────────────────────────────────────

async function listExistingPosts() {
  const url = `${SITE}/api/admin/posts?fields=slug,title,locale,tags&status=published`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to list posts (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.posts ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Locale strategy
//   --locale=en     → only EN
//   --locale=vi     → only VI
//   --locale=both   → bilingual (default; EN first, then VI translation)
//   (omitted)       → "both"
// ─────────────────────────────────────────────────────────────────────────────

function localesToGenerate() {
  if (localeArg === "en") return ["en"];
  if (localeArg === "vi") return ["vi"];
  return ["en", "vi"];           // bilingual default
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt (user message)
// ─────────────────────────────────────────────────────────────────────────────

function buildOriginalPrompt(locale, existing) {
  const inLocale = existing.filter((p) => p.locale === locale);
  const lines = inLocale.map(
    (p) => `- ${p.slug}: "${p.title}" (tags: ${p.tags.join(", ")})`,
  );
  const allSlugs = Array.from(new Set(existing.map((p) => p.slug)));
  const today = new Date().toISOString().slice(0, 10);

  return `Today is ${today}. Generate one blog post in locale="${locale}".

Existing ${locale.toUpperCase()} posts (do NOT duplicate slug, title, or angle):
${lines.length > 0 ? lines.join("\n") : "(none yet)"}

All existing slugs across both locales (must not collide):
${allSlugs.map((s) => `- ${s}`).join("\n")}

Process:
1. Re-read sections §0 (biography), §1 (voice), §2 (structure), §6 (topic matrix), §9 (checklist), §10 (anti-patterns) of the rule book in the system prompt.
2. Pick ONE idea from §6 that does not overlap with any existing post above. Do NOT reuse a slug already in the list.
3. Write the post in locale="${locale}".

Output ONLY a JSON object matching the response schema — no prose, no markdown wrapper, no explanation. The "body" field is the post's markdown content (no H1, start with prose or an H2). The "slug" is kebab-case, unique, ≤ 60 chars.

Reminder of the bar:
- Title: 6–12 words, declarative, has tension. NOT a listicle.
- Excerpt: 1–2 sentences, ≤ 200 chars, promises a payoff.
- **Body MUST contain at least 3 H2 sections using \`## Heading\` markdown syntax** at the start of a line. Use H3 (\`### \`) only inside an H2 with 2+ sub-beats. Do NOT use H1 — the title is rendered separately. Do NOT use bold-only pseudo-headings (\`**Section name**\` on its own line) — they don't render as TOC entries.
- Body length: 800–1500 words. ≥ 1 concrete anecdote tied to the biography. ≥ 1 italicized lesson (single asterisks: \`*lesson here*\`).
- Tags: 2–5 from §5 taxonomy only.
- NO listicles, NO "as developers we", NO "in today's fast-paced world", NO corporate verbs.`;
}

/**
 * Bilingual translation prompt: given an EN draft, produce its VI counterpart.
 * Keeps slug + tags identical, preserves the central thesis and anecdotes,
 * but writes in native Vietnamese rather than transliterating.
 */
function buildTranslationPrompt(source, targetLocale) {
  return `Translate the blog post below from ${source.locale.toUpperCase()} to ${targetLocale.toUpperCase()} for the same blog (huyhk.dev), keeping it native — DO NOT transliterate.

Constraints:
1. Keep the SAME slug exactly: ${source.slug}
2. Keep the SAME tags exactly: ${JSON.stringify(source.tags)}
3. locale must be "${targetLocale}"
4. Preserve the central thesis, all anecdotes, the year/place references from §0 of the system prompt.
5. Preserve the H2 section structure (same number of sections, same beats — translate the headings).
6. Preserve any callouts (\`> **Label**\\n>\\n> body\`), \`*italicized lessons*\`, and code blocks verbatim where they contain code; translate prose inside callouts.
7. Title must feel native ${targetLocale === "vi" ? "Vietnamese (not awkward translation)" : "English"} — 6–12 words, declarative, has tension.
8. Excerpt: 1–2 sentences, ≤ 200 chars, native in the target language.
9. Length: 800–1500 words after translation.
10. Voice should match the system prompt's voice rules — first-person, observed, no listicles, no "as developers we", no SEO-bait.

For ${targetLocale === "vi" ? "Vietnamese: use Huy's natural cadence — short sentences, em-dash asides. Tech terms (React, Next.js, OAuth, queue, middleware) stay in English. Use 'tôi' not 'mình'. Use 'kiểm thử' or keep 'tester' depending on which feels natural in context — match the flagship vi posts (tester-dna.vi, oauth-sso-warning.vi)." : "English: match Huy's voice in the flagship en posts."}

SOURCE POST (locale=${source.locale}):
\`\`\`md
TITLE: ${source.title}
EXCERPT: ${source.excerpt}

${source.body}
\`\`\`

Output ONLY a JSON object matching the response schema. No prose, no markdown wrapper.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON schema (Claude Code --json-schema)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Run `claude` CLI — returns parsed envelope { result, usage, ... }
// ─────────────────────────────────────────────────────────────────────────────

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
      "--disable-slash-commands", // avoid skill auto-triggering on content keywords
      userPrompt,
    ];

    if (verbose) {
      console.error("[cli] claude " + claudeArgs.slice(0, -1).map((a) => (a.length > 80 ? a.slice(0, 80) + "…" : a)).join(" ") + " <user-prompt>");
    }

    const child = spawn("claude", claudeArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let lastDot = Date.now();

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (Date.now() - lastDot > 2000) {
        process.stderr.write(".");
        lastDot = Date.now();
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (verbose) process.stderr.write(chunk.toString());
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to spawn 'claude': ${err.message}. Is the CLI on PATH? Run \`which claude\`.`));
    });
    child.on("close", (code) => {
      process.stderr.write("\n");
      if (code !== 0) {
        return reject(
          new Error(`claude exited with code ${code}.\nstderr: ${stderr.slice(0, 1000)}`),
        );
      }
      let envelope;
      try {
        envelope = JSON.parse(stdout);
      } catch (err) {
        return reject(
          new Error(
            `claude returned non-JSON.\nFirst 500 chars:\n${stdout.slice(0, 500)}`,
          ),
        );
      }
      resolve(envelope);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST as draft
// ─────────────────────────────────────────────────────────────────────────────

async function postDraft(post) {
  if (dryRun) {
    console.log("--- DRY RUN — not posting ---");
    console.log(JSON.stringify(post, null, 2));
    return;
  }
  const res = await fetch(`${SITE}/api/admin/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...post, status: "draft" }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`POST failed (${res.status}): ${json.error ?? "unknown"}`);
  }
  console.log(`✓ Draft created.`);
  console.log(`  id: ${json.post.id}`);
  console.log(`  slug: ${json.post.slug}`);
  console.log(`  review: ${SITE}/admin/posts/${json.post.id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

/** Parse a claude envelope (with --json-schema). Throws on bad shape. */
function extractDraft(envelope) {
  let draft = envelope.structured_output;
  if (!draft) {
    if (typeof envelope.result === "string" && envelope.result.trim().startsWith("{")) {
      draft = JSON.parse(envelope.result);
    } else {
      throw new Error(
        `Missing structured_output. is_error=${envelope.is_error}, stop=${envelope.stop_reason}, result="${(envelope.result ?? "").slice(0, 200)}"`,
      );
    }
  }
  return draft;
}

function logEnvelope(label, envelope) {
  const meta = [
    envelope.duration_ms ? `duration=${envelope.duration_ms}ms` : null,
    envelope.num_turns ? `turns=${envelope.num_turns}` : null,
    envelope.total_cost_usd != null
      ? `cost=$${envelope.total_cost_usd.toFixed(4)}`
      : "cost=(subscription)",
  ]
    .filter(Boolean)
    .join(", ");
  console.error(`[claude:${label}] ${meta}`);
}

function validateOrAbort(draft, label) {
  const problems = validate(draft);
  if (problems.length > 0) {
    console.error(`[${label}] validation issues:`);
    for (const p of problems) console.error("  ×", p);
    if (!dryRun) {
      console.error("Refusing to POST. Re-run with --dry-run to inspect.");
      process.exit(2);
    }
    console.error("(Continuing in --dry-run mode despite validation issues.)");
  } else {
    console.error(`[${label}] ✓ all editorial checks pass`);
  }
}

async function main() {
  console.error(`[1/_] Fetching existing posts from ${SITE} …`);
  const existing = await listExistingPosts();
  const locales = localesToGenerate();
  console.error(
    `[2/_] Will generate locale${locales.length > 1 ? "s" : ""}: ${locales.join(" + ")}`,
  );

  // Step 1 — original (always EN if generating both; otherwise the requested locale).
  const originalLocale = locales.includes("en") ? "en" : locales[0];
  console.error(`[3/_] Generating original (locale=${originalLocale}) …`);
  const originalEnvelope = await runClaude(buildOriginalPrompt(originalLocale, existing));
  const originalDraft = extractDraft(originalEnvelope);
  logEnvelope(originalLocale, originalEnvelope);
  validateOrAbort(originalDraft, originalLocale);
  await postDraft(originalDraft);

  // Step 2 — translate into each remaining locale, sharing slug + tags.
  for (const target of locales) {
    if (target === originalLocale) continue;
    console.error(`[4/_] Translating into ${target} (slug ${originalDraft.slug}) …`);
    const translationEnvelope = await runClaude(
      buildTranslationPrompt(originalDraft, target),
    );
    const translationDraft = extractDraft(translationEnvelope);
    // Enforce slug + tags match — even if the model deviated.
    translationDraft.slug = originalDraft.slug;
    translationDraft.tags = originalDraft.tags;
    translationDraft.locale = target;
    logEnvelope(target, translationEnvelope);
    validateOrAbort(translationDraft, target);
    await postDraft(translationDraft);
  }
}

main().catch((err) => {
  console.error("FATAL:", err.message ?? err);
  process.exit(1);
});
