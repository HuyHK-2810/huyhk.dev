import type { Config } from "drizzle-kit";

/**
 * drizzle-kit is used for introspection + type generation, NOT for applying
 * migrations. Migration SQL lives in `supabase/migrations/*.sql` and is
 * executed via Supabase (dashboard or Management API).
 *
 * Run after schema changes:
 *   - `pnpm drizzle-kit generate` to produce a diff SQL for review
 *   - copy the relevant DDL into a new `supabase/migrations/000N_*.sql`
 *   - apply via Supabase
 */
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
} satisfies Config;
