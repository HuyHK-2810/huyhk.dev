/**
 * Drizzle schema — mirrors the Supabase Postgres tables.
 *
 * Source of truth still lives in `supabase/migrations/*.sql` (executed by
 * Supabase). Drizzle is used here only as a type-safe query layer; we do not
 * use `drizzle-kit migrate` against the cloud DB. When you change the SQL
 * schema, mirror the change here so the TypeScript types stay accurate.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const postStatus = pgEnum("post_status", ["draft", "published", "archived"]);
export const postLocale = pgEnum("post_locale", ["en", "vi"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    slug: text("slug").notNull(),
    // The DB stores these as plain text + CHECK constraints, not real enums —
    // typing as text here keeps Drizzle's generated SQL matching what's in
    // Supabase. Runtime values are still narrowed via the union below.
    locale: text("locale").$type<"en" | "vi">().notNull().default("en"),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    status: text("status").$type<"draft" | "published" | "archived">().notNull().default("draft"),
    date: timestamp("date", { withTimezone: true }),
    wordCount: integer("word_count"),
    readingMinutes: integer("reading_minutes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => ({
    slugLocaleUnique: uniqueIndex("posts_slug_locale_unique").on(t.slug, t.locale),
    statusPublishedAt: index("posts_status_published_at_idx").on(t.status, t.publishedAt),
  }),
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
