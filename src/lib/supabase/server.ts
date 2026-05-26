import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client bound to the current request's cookies.
 *
 * Use this inside Server Components, Server Actions, Route Handlers.
 * Sessions are read from / written back to the request cookies, so this is
 * the only API that should run auth-sensitive code on the server.
 *
 * Uses the publishable key (browser-safe). RLS still gates rows.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component without a writable cookies API.
            // The middleware will refresh cookies on the next request, so this
            // can be safely ignored.
          }
        },
      },
    },
  );
}

/** Returns the current authenticated user, verified against Supabase Auth. */
export async function getCurrentUser() {
  const supa = await createSupabaseServerClient();
  const { data } = await supa.auth.getUser();
  return data.user ?? null;
}

/** Returns the current user's profile row (with role) or null. */
export async function getCurrentProfile() {
  const supa = await createSupabaseServerClient();
  const { data: userData } = await supa.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supa
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", userData.user.id)
    .single();
  return (data ?? null) as
    | { id: string; email: string; display_name: string | null; role: "customer" | "author" | "admin" }
    | null;
}
