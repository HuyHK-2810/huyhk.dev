# Blog CMS setup

The site reads blog posts from Supabase Postgres. If Supabase isn't configured,
it falls back to MDX files in `src/content/posts/` — so the site never goes
down during setup.

## 1. Create a Supabase project

1. Go to https://supabase.com → New project.
2. Pick a region near your audience (Singapore for VN).
3. Save the generated database password somewhere safe.

## 2. Run the schema migration

Open Supabase SQL editor, paste the contents of
`supabase/migrations/0001_posts.sql`, run.

This creates the `posts` table with RLS enabled. Public read is limited to
`status='published'`; all writes go through the service-role key on the server.

## 3. Wire env vars

Copy `.env.example` → `.env.local`. From Supabase **Project Settings → API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx   # safe in browser
SUPABASE_SECRET_KEY=sb_secret_xxx                          # server-only, never ship

ADMIN_TOKEN=$(openssl rand -base64 32)
```

Add the same values in Vercel project settings → Environment Variables.

## 4. Sign in to /admin

- `npm run dev`
- Visit `http://localhost:3000/admin/login`
- Enter `ADMIN_TOKEN` value
- You're redirected to `/admin` with the post list

## 5. Use the admin UI

- **/admin** — list all posts (drafts + published + archived)
- **/admin/new** — create a new post. Title + markdown body required.
  Pick locale (en/vi) and tags. "Save & publish" flips status and sets
  `published_at`.
- **/admin/posts/[id]** — edit any post.

Markdown features that just work:

- Fenced code blocks: ` ```ts ` → Shiki syntax highlight
- Headings `##` / `###` → auto-slugged, become TOC entries on the public page
- GFM: tables, strikethrough, task lists, autolinks
- Inline HTML is allowed (use sparingly)

> Note: MDX components like `<Callout>` only work for posts authored as
> `.mdx` files (the original five). DB-sourced posts are markdown-only.

## 6. AI-driven authoring

Any AI agent / shell can post drafts by hitting the admin API with a Bearer
token:

```bash
curl -X POST https://huyhk.dev/api/admin/posts \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First note from the agent",
    "locale": "en",
    "tags": ["career", "agents"],
    "excerpt": "Short summary used in OG image + listing.",
    "body": "## Hello world\n\nMarkdown body here...",
    "status": "draft"
  }'
```

Endpoints:

| Method | Path                            | Purpose                       |
| ------ | ------------------------------- | ----------------------------- |
| GET    | /api/admin/posts                | List (?status= ?locale=)      |
| POST   | /api/admin/posts                | Create (returns the new row)  |
| GET    | /api/admin/posts/[id]           | Read one                      |
| PATCH  | /api/admin/posts/[id]           | Partial update                |
| DELETE | /api/admin/posts/[id]           | Delete permanently            |

Auth: either Bearer header (for API / AI) or admin session cookie (for UI).

## 7. Migration of existing MDX posts (optional)

The 5 MDX posts continue to serve until you copy them into Supabase. If you
want them DB-sourced:

1. For each `.mdx` file, copy frontmatter into a new admin post.
2. Paste the body (the part after `---`) into the markdown editor.
3. Set status `published` and the same date.
4. Delete the MDX file from `src/content/posts/` to avoid duplicates.

Or: I can write a one-shot migration script if you want. Ask.
