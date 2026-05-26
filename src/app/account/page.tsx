import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import { getCurrentProfile } from "@/lib/supabase/server";
import { signOutAction } from "@/features/auth/lib/actions";

export const metadata = {
  title: "Account — huyHK",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account");

  const joinedYear = new Date().getFullYear(); // placeholder until we query created_at

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[var(--container-wide)] px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <div className="max-w-[var(--container-prose)]">
          <div className="section-label mb-3">{"{ account }"}</div>
          <h1 className="font-serif text-[clamp(32px,5vw,44px)] font-normal leading-[1.15] tracking-tight text-ink">
            Hi,{" "}
            <span className="italic text-ember">
              {profile.display_name ?? profile.email.split("@")[0]}
            </span>
            .
          </h1>
          <p className="mt-3 font-mono text-[13px] text-ink-faint">
            Signed in as {profile.email} ·{" "}
            <span className="uppercase tracking-[0.06em]">{profile.role}</span>
          </p>

          <section className="mt-10 grid gap-px overflow-hidden rounded-md bg-[var(--line-soft)] md:grid-cols-2">
            <Link
              href="/writing"
              className="group flex flex-col gap-2 bg-paper-pure p-6 transition-colors hover:bg-ember-soft"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
                ↗ writing
              </div>
              <div className="font-serif text-[18px] font-medium text-ink group-hover:text-ember">
                Read the notes
              </div>
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="group flex flex-col gap-2 bg-paper-pure p-6 transition-colors hover:bg-ember-soft"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
                  ↗ admin
                </div>
                <div className="font-serif text-[18px] font-medium text-ink group-hover:text-ember">
                  Manage posts
                </div>
              </Link>
            )}
          </section>

          <form action={signOutAction} className="mt-10">
            <button
              type="submit"
              className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-ember hover:text-ember"
            >
              Sign out
            </button>
          </form>

          <p className="mt-6 font-mono text-[11px] text-ink-faint">
            Member since {joinedYear}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
