import { notFound, redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import PostEditor from "@/components/admin/post-editor";
import { verifySessionCookie } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type Params = { id: string };

export default async function EditPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await verifySessionCookie();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supa = getSupabaseAdmin();
  if (!supa) {
    return (
      <AdminShell>
        <p className="font-mono text-[13px] text-[#C24A1F]">
          Supabase not configured.
        </p>
      </AdminShell>
    );
  }

  const { data, error } = await supa.from("posts").select("*").eq("id", id).single();
  if (error || !data) notFound();

  return (
    <AdminShell>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal text-ink">
          Edit post
        </h1>
        <a
          href={`/writing/${data.slug}${data.locale === "vi" ? "?lang=vi" : ""}`}
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
            id: data.id,
            slug: data.slug,
            locale: data.locale,
            title: data.title,
            excerpt: data.excerpt ?? "",
            body: data.body ?? "",
            tagsCsv: (data.tags ?? []).join(", "),
            status: data.status,
            date: data.date ?? new Date().toISOString(),
          }}
        />
      </div>
    </AdminShell>
  );
}
