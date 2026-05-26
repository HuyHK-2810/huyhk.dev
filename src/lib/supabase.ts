import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

let _public: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

/** Read-only client safe for server use (publishable key — sees only published rows). */
export function getSupabaseRead(): SupabaseClient | null {
  if (!url || !publicKey) return null;
  if (!_public) {
    _public = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _public;
}

/** Privileged client — bypasses RLS. Server-only. NEVER ship to the browser. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !secretKey) return null;
  if (!_admin) {
    _admin = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && publicKey);
}
