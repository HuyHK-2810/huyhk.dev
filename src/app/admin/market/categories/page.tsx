import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { listAllCategoriesForAdmin } from "@/features/market/lib/queries";
import CategoriesEditor from "@/features/market/components/categories-editor";

export default async function CategoriesPage() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const categories = await listAllCategoriesForAdmin();
  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">Market — Categories</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Add new categories whenever you ship a new product line. Slug is permanent — products
        reference it via URL.
      </p>
      <div className="mt-8">
        <CategoriesEditor initial={categories} />
      </div>
    </AdminShell>
  );
}
