import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { listAllPostsForAdmin } from "@/features/blog/lib/posts-db";
import { isDbConfigured } from "@/lib/db";

function fmt(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function AdminIndex() {
  const session = await verifySessionCookie();
  if (!session) redirect("/admin/login");

  const configured = isDbConfigured();
  const rows = configured ? await listAllPostsForAdmin() : [];

  return (
    <AdminShell>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal text-ink">Posts</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember"
        >
          + New post
        </Link>
      </div>

      {!configured && (
        <div className="mt-8 rounded-md border border-[var(--line)] border-l-[3px] border-l-ember bg-ember-soft px-5 py-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember-deep">
            Database not configured
          </div>
          <p className="mt-2 text-[14px] text-ink">
            Set{" "}
            <code className="rounded bg-paper-pure px-1.5 py-0.5 font-mono text-[12px]">
              DATABASE_URL
            </code>{" "}
            (Supabase Project Settings → Database → Transaction Pooler URI) in{" "}
            <code>.env.local</code>. The site keeps reading from Supabase REST or MDX
            files until then.
          </p>
        </div>
      )}

      {configured && (
        <div className="mt-8 overflow-hidden rounded-md border border-[var(--line)]">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-paper-pure font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Lang</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Min</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                    No posts yet. Create one with{" "}
                    <Link href="/admin/new" className="text-ember underline">
                      + New post
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-[var(--line-soft)] hover:bg-paper-pure"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/posts/${p.id}`}
                      className="font-serif text-[15px] text-ink hover:text-ember"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">
                    {p.slug}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] uppercase text-ink-soft">
                    {p.locale}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]",
                        p.status === "published"
                          ? "border-ember bg-ember-soft text-ember-deep"
                          : p.status === "draft"
                            ? "border-[var(--line)] text-ink-soft"
                            : "border-[var(--line-soft)] text-ink-faint",
                      ].join(" ")}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-faint">
                    {fmt(p.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-faint">
                    {p.readingMinutes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
