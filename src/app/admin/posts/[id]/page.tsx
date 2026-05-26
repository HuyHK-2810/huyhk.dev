import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import AdminShell from "@/features/admin/components/admin-shell";
import PostEditor from "@/features/admin/components/post-editor";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { getDb, schema } from "@/lib/db";

type Params = { id: string };

export default async function EditPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await verifySessionCookie();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const db = getDb();
  if (!db) {
    return (
      <AdminShell>
        <p className="font-mono text-[13px] text-[#C24A1F]">
          DATABASE_URL not configured.
        </p>
      </AdminShell>
    );
  }

  const [row] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!row) notFound();

  return (
    <AdminShell>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal text-ink">
          Edit post
        </h1>
        <a
          href={`/writing/${row.slug}${row.locale === "vi" ? "?lang=vi" : ""}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[12px] text-ink-soft hover:text-ember"
        >
          view on site ↗
        </a>
      </div>
      <div className="mt-8">
        <PostEditor
          mode="edit"
          initial={{
            id: row.id,
            slug: row.slug,
            locale: row.locale,
            title: row.title,
            excerpt: row.excerpt ?? "",
            body: row.body ?? "",
            tagsCsv: (row.tags ?? []).join(", "),
            status: row.status,
            date: row.date ? row.date.toISOString() : new Date().toISOString(),
          }}
        />
      </div>
    </AdminShell>
  );
}
