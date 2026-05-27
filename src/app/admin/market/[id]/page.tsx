import { notFound, redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import ProductEditor from "@/features/market/components/product-editor";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import {
  getProductByIdForAdmin,
  listAllCategoriesForAdmin,
} from "@/features/market/lib/queries";

type Params = { id: string };

export default async function EditProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(id),
    listAllCategoriesForAdmin(),
  ]);
  if (!product) notFound();

  const cat = categories.find((c) => c.id === product.categoryId);

  return (
    <AdminShell>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal text-ink">Edit product</h1>
        {product.status === "published" && cat && (
          <a
            href={`/market/${cat.slug}/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-ink-soft hover:text-ember"
          >
            view on site ↗
          </a>
        )}
      </div>
      <div className="mt-8">
        <ProductEditor
          mode="edit"
          categories={categories}
          initial={{
            id: product.id,
            slug: product.slug,
            categoryId: product.categoryId,
            title: product.title,
            subtitle: product.subtitle ?? "",
            shortDescription: product.shortDescription ?? "",
            description: product.description,
            coverUrl: product.coverUrl ?? "",
            gallery: product.gallery,
            priceCents: product.priceCents,
            compareAtPriceCents: product.compareAtPriceCents,
            currency: product.currency,
            productType: product.productType,
            status: product.status,
            featured: product.featured,
            tags: product.tags,
            metadataJson: JSON.stringify(product.metadata, null, 2),
            stockCount: product.stockCount,
            demoUrl: product.demoUrl ?? "",
            previewFiles: product.previewFiles,
            downloadFiles: product.downloadFiles,
          }}
        />
      </div>
    </AdminShell>
  );
}
