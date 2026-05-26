"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim() || null;

  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid email." };
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supa = await createSupabaseServerClient();
  const { error } = await supa.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      // For prod, set a Vercel-aware origin and let Supabase email confirm.
      emailRedirectTo:
        (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") +
        "/auth/callback",
    },
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password) {
    return { ok: false, error: "Email and password required." };
  }

  const supa = await createSupabaseServerClient();
  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOutAction() {
  const supa = await createSupabaseServerClient();
  await supa.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Google OAuth sign-in. Returns the URL the client should redirect to. */
export async function signInWithGoogle(): Promise<{ url: string } | { error: string }> {
  const supa = await createSupabaseServerClient();
  const { data, error } = await supa.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") +
        "/auth/callback",
    },
  });
  if (error || !data.url) return { error: error?.message ?? "OAuth failed" };
  return { url: data.url };
}
