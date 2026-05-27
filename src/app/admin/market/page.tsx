import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/features/admin/components/admin-shell";
import { verifySessionCookie } from "@/features/admin/lib/auth";
import {
  listAllCategoriesForAdmin,
  listAllProductsForAdmin,
} from "@/features/market/lib/queries";

function fmt(d: Date | string | null): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function formatMoney(cents: number, currency: string): string {
  if (currency === "VND") return `${Math.round(cents / 100).toLocaleString("vi-VN")} ₫`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function AdminMarketIndex() {
  const ok = await verifySessionCookie();
  if (!ok) redirect("/admin/login");

  const [products, categories] = await Promise.all([
    listAllProductsForAdmin(),
    listAllCategoriesForAdmin(),
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <AdminShell>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal text-ink">Market — Products</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/market/categories"
            className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-soft hover:border-ember hover:text-ember"
          >
            Categories ({categories.length})
          </Link>
          <Link
            href="/admin/market/new"
            className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember"
          >
            + New product
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-[var(--line)]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-paper-pure font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  No products yet.{" "}
                  <Link href="/admin/market/new" className="text-ember underline">
                    + New product
                  </Link>
                  .
                </td>
              </tr>
            )}
            {products.map((p) => {
              const cat = catMap.get(p.categoryId);
              return (
                <tr key={p.id} className="border-t border-[var(--line-soft)] hover:bg-paper-pure">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/market/${p.id}`}
                      className="font-serif text-[15px] text-ink hover:text-ember"
                    >
                      {p.title}
                    </Link>
                    {p.featured && (
                      <span className="ml-2 rounded-full bg-ember-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-ember-deep">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{cat?.slug ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink">
                    {formatMoney(p.priceCents, p.currency)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-faint">
                    {p.stockCount > 0 ? p.stockCount : <span className="text-[#C24A1F]">0</span>}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
