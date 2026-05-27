import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import ProductEditor from "@/features/market/components/product-editor";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import { listAllCategoriesForAdmin } from "@/features/market/lib/queries";

export default async function NewProductPage() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const categories = await listAllCategoriesForAdmin();

  return (
    <AdminShell>
      <h1 className="font-serif text-[28px] font-normal text-ink">New product</h1>
      <p className="mt-2 font-mono text-[12px] text-ink-faint">
        Save as draft first to get an ID — then upload cover, gallery, preview & download files.
      </p>
      <div className="mt-8">
        <ProductEditor
          mode="create"
          categories={categories}
          initial={{
            slug: "",
            categoryId: categories[0]?.id ?? "",
            title: "",
            subtitle: "",
            shortDescription: "",
            description: "",
            coverUrl: "",
            gallery: [],
            priceCents: 2900,
            compareAtPriceCents: null,
            currency: "USD",
            productType: "digital",
            status: "draft",
            featured: false,
            tags: [],
            metadataJson: "{}",
            stockCount: 999,
            demoUrl: "",
            previewFiles: [],
            downloadFiles: [],
          }}
        />
      </div>
    </AdminShell>
  );
}
