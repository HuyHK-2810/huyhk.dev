import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Server-only Drizzle client.
 *
 * Pulls the Supabase Postgres connection string from `DATABASE_URL` — get this
 * value at Supabase Dashboard → Project Settings → Database → Connection string
 * (Transaction Pooler URL is recommended for serverless: it shares a pool
 * across function invocations).
 *
 * NEVER import this module from a client component. The DB URL contains the DB
 * password — exposing it to the browser is game-over.
 */

const connectionString = process.env.DATABASE_URL;

let _client: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!connectionString) return null;
  if (!_client) {
    const sql = postgres(connectionString, {
      // Disable prepare in serverless (pooler doesn't keep prepared statements
      // across invocations).
      prepare: false,
      // Single connection per function instance is fine for Vercel.
      max: 1,
    });
    _client = drizzle(sql, { schema });
  }
  return _client;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString);
}

export { schema };
