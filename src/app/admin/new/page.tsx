import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import PostEditor from "@/features/admin/components/post-editor";
import { verifySessionCookie } from "@/features/admin/lib/auth";

export default async function NewPostPage() {
  const session = await verifySessionCookie();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">New post</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Write in markdown. Fenced code blocks get Shiki highlighting on the
        public site.
      </p>
      <div className="mt-8">
        <PostEditor
          mode="create"
          initial={{
            slug: "",
            locale: "en",
            title: "",
            excerpt: "",
            body: "",
            tagsCsv: "",
            status: "draft",
            date: new Date().toISOString(),
          }}
        />
      </div>
    </AdminShell>
  );
}
