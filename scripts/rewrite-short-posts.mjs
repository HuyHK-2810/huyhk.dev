#!/usr/bin/env node
/**
 * One-shot: rewrite short posts (word_count < 500) by feeding their title +
 * excerpt + original body to Claude and asking for a full-length expansion
 * that obeys AI_PUBLISHING.md. PATCHes the existing rows (keeps slug, date,
 * tags). Title can be lightly improved but the slug must NOT change.
 *
 * Uses the `claude` CLI (no API key — your Claude Code subscription).
 *
 * Usage:
 *   node --env-file=.env.local scripts/rewrite-short-posts.mjs [--dry-run] [--slug=<slug>]
 *
 * Examples:
 *   # Rewrite all short posts
 *   node --env-file=.env.local scripts/rewrite-short-posts.mjs
 *
 *   # Just one
 *   node --env-file=.env.local scripts/rewrite-short-posts.mjs --slug=ag-grid-to-shadcn
 *
 *   # Dry-run (show what would be PATCHed, don't write)
 *   node --env-file=.env.local scripts/rewrite-short-posts.mjs --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { validate } from "./ai-publish.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const verbose = args.includes("--verbose");

const SITE = process.env.AI_PUBLISH_SITE ?? "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const WORD_THRESHOLD = 500;

if (!ADMIN_TOKEN) {
  console.error("Missing ADMIN_TOKEN env var.");
  process.exit(1);
}

const RULES = fs.readFileSync(
  path.join(process.cwd(), "AI_PUBLISHING.md"),
  "utf8",
);

// ─────────────────────────────────────────────────────────────────────────────
// Schema — same as daily-publish-cli but `slug` is the existing one (returned
// for sanity but not used for the PATCH path).
// ─────────────────────────────────────────────────────────────────────────────

const REWRITE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    body: { type: "string" },
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
  },
  required: ["title", "excerpt", "body", "tags"],
};

// ─────────────────────────────────────────────────────────────────────────────

async function fetchShortPosts() {
  const res = await fetch(
    `${SITE}/api/admin/posts?fields=id,slug,locale,word_count,reading_minutes,title,excerpt,tags&status=published`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } },
  );
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const json = await res.json();
  return (json.posts ?? []).filter((p) => (p.word_count ?? 0) < WORD_THRESHOLD);
}

async function fetchFullPost(id) {
  const res = await fetch(`${SITE}/api/admin/posts/${id}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  if (!res.ok) throw new Error(`fetch post ${id} failed: ${res.status}`);
  const json = await res.json();
  return json.post;
}

// ─────────────────────────────────────────────────────────────────────────────
// User prompt — anchor the rewrite to the existing title + excerpt + seed body
// so the AI extends rather than reinvents.
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(post, peers) {
  const peerLines = peers
    .filter((p) => p.slug !== post.slug)
    .map((p) => `- ${p.slug}: "${p.title}"`);

  return `Rewrite the SHORT blog post below into a FULL-length essay (800–1500 words) that obeys the rule book in the system prompt.

EXISTING POST (locale=${post.locale}):
- slug: ${post.slug}          ← preserve exactly; do not change
- title: ${post.title}
- excerpt: ${post.excerpt}
- tags: ${(post.tags ?? []).join(", ")}

EXISTING BODY (this is the seed — keep the central claim, expand around it):
\`\`\`md
${post.body}
\`\`\`

Other published posts on this blog (do not duplicate angle or anecdote):
${peerLines.length > 0 ? peerLines.join("\n") : "(none)"}

Requirements:
1. Preserve the same central thesis as the existing body (e.g. "30% wasn't a testing win", "Python+Node seam at structured extraction").
2. **Body MUST contain at least 3 H2 sections using \`## Heading\` markdown syntax** at the start of a line. Each H2 begins one distinct beat of the argument. Use H3 (\`### \`) only inside an H2 with 2+ sub-beats. Do NOT use H1 — the title is rendered separately. Do NOT use bold-only pseudo-headings (\`**Section name**\` on its own line) — they don't render as TOC entries.
3. Length: 800–1500 words total (the system prompt's §2 specifies this).
4. Add at least ONE concrete anecdote from the biography in §0 of the rule book (year, place, what shipped, what broke).
5. Include at least ONE italicized lesson (one sentence wrapped in single asterisks: \`*lesson here*\`).
6. Use the callout pattern (\`> **Label**\\n>\\n> body\`) once if useful, max twice.
7. Voice: first-person, observed, self-deprecating where honest. Match the tone of the flagship posts (\`tester-dna\`, \`oauth-sso-warning\`).
8. NO "as developers we", NO "in today's fast-paced world", NO listicle phrasing.
9. Title can be improved (still 6–12 words, declarative), but stay on the same topic.
10. Tags: keep the existing tags or replace with 2–5 from the §5 taxonomy that better fit the expanded version.

Output ONLY a JSON object matching the schema — no prose, no markdown wrapper.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude CLI invocation
// ─────────────────────────────────────────────────────────────────────────────

function runClaude(userPrompt) {
  return new Promise((resolve, reject) => {
    const claudeArgs = [
      "--print",
      "--output-format", "json",
      "--json-schema", JSON.stringify(REWRITE_SCHEMA),
      "--append-system-prompt", RULES,
      "--model", "opus",
      "--effort", "high",
      "--no-session-persistence",
      "--disable-slash-commands",
      userPrompt,
    ];

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
          new Error(`Non-JSON from claude: ${err.message}\n${stdout.slice(0, 500)}`),
        );
      }
      const out = envelope.structured_output;
      if (!out) {
        return reject(
          new Error(
            `No structured_output. is_error=${envelope.is_error}, stop=${envelope.stop_reason}`,
          ),
        );
      }
      resolve({ data: out, envelope });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH the post
// ─────────────────────────────────────────────────────────────────────────────

async function patchPost(id, patch) {
  const res = await fetch(`${SITE}/api/admin/posts/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PATCH failed (${res.status}): ${json.error ?? "unknown"}`);
  }
  return json.post;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main loop
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.error(`[scan] Fetching short posts (word_count < ${WORD_THRESHOLD}) …`);
  let candidates = await fetchShortPosts();
  if (onlySlug) candidates = candidates.filter((p) => p.slug === onlySlug);

  if (candidates.length === 0) {
    console.error("No short posts to rewrite.");
    return;
  }

  console.error(
    `[scan] ${candidates.length} candidate(s): ${candidates.map((p) => `${p.slug} (${p.word_count}w)`).join(", ")}`,
  );

  // Peer titles to help avoid duplication
  const allRes = await fetch(
    `${SITE}/api/admin/posts?fields=slug,title&status=published`,
    { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } },
  );
  const allPeers = (await allRes.json()).posts ?? [];

  let ok = 0, failed = 0;
  for (const candidate of candidates) {
    const post = await fetchFullPost(candidate.id);
    console.error(
      `\n──── ${post.slug} (${candidate.word_count}w → target 800-1500w) ────`,
    );

    let result;
    try {
      result = await runClaude(buildPrompt(post, allPeers));
    } catch (err) {
      console.error(`× claude failed for ${post.slug}: ${err.message}`);
      failed++;
      continue;
    }

    const { data: rewrite, envelope } = result;
    console.error(
      `[claude] duration=${envelope.duration_ms}ms, cost=${envelope.total_cost_usd != null ? "$" + envelope.total_cost_usd.toFixed(4) : "(subscription)"}, turns=${envelope.num_turns}`,
    );

    // Build a candidate post object for validate() — it expects the full shape
    const wordCount = rewrite.body.split(/\s+/).filter(Boolean).length;
    console.error(`[words] rewritten body: ${wordCount} words`);

    const candidateForValidate = {
      title: rewrite.title,
      slug: post.slug,
      locale: post.locale,
      excerpt: rewrite.excerpt,
      tags: rewrite.tags,
      body: rewrite.body,
    };
    const problems = validate(candidateForValidate);
    if (problems.length > 0) {
      console.error("Validation issues:");
      for (const p of problems) console.error("  ×", p);
      console.error(`Skipping PATCH for ${post.slug} (re-run --dry-run to inspect).`);
      failed++;
      continue;
    }
    console.error("[validate] ✓");

    if (dryRun) {
      console.error("--- DRY RUN — would PATCH ---");
      console.log(JSON.stringify({ id: post.id, ...candidateForValidate }, null, 2));
      continue;
    }

    const patched = await patchPost(post.id, {
      title: rewrite.title,
      excerpt: rewrite.excerpt,
      body: rewrite.body,
      tags: rewrite.tags,
    });
    // Drizzle returns camelCase, Supabase REST returns snake_case — handle both.
    const wc = patched.word_count ?? patched.wordCount;
    const rm = patched.reading_minutes ?? patched.readingMinutes;
    console.error(`✓ PATCHed ${patched.slug} — ${wc}w, ${rm}min`);
    ok++;
  }

  console.error(`\n[done] ${ok} patched, ${failed} failed.`);
}

main().catch((err) => {
  console.error("FATAL:", err.message ?? err);
  process.exit(1);
});
