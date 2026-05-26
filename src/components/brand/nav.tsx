import { getCurrentProfile } from "@/lib/supabase/server";
import NavClient from "./nav-client";

export default async function Nav() {
  let profile: { display_name: string | null; role: string } | null = null;
  try {
    const p = await getCurrentProfile();
    profile = p ? { display_name: p.display_name, role: p.role } : null;
  } catch {
    profile = null;
  }
  return <NavClient profile={profile} />;
}
