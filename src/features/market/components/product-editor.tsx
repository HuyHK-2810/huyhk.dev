"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MarketCategory, ProductFile } from "@/lib/db/market";

export type ProductFormData = {
  id?: string;
  slug: string;
  categoryId: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  coverUrl: string;
  gallery: string[];
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  productType: "digital" | "physical" | "service";
  status: "draft" | "published" | "archived";
  featured: boolean;
  tags: string[];
  metadataJson: string;
  stockCount: number;
  demoUrl: string;
  previewFiles: ProductFile[];
  downloadFiles: ProductFile[];
};

type Props = {
  initial: ProductFormData;
  categories: MarketCategory[];
  mode: "create" | "edit";
};

export default function ProductEditor({ initial, categories, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update<K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFile(
    file: File,
    slot: "cover" | "gallery" | "preview" | "download",
  ): Promise<ProductFile & { url: string | null }> {
    if (!form.id) throw new Error("Save the product first to get an ID");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("product_id", form.id);
    fd.append("slot", slot);
    const res = await fetch("/api/admin/market/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `upload failed ${res.status}`);
    return {
      name: json.name,
      r2_key: json.key,
      size: json.size,
      mime: json.mime,
      url: json.url,
    };
  }

  async function save(targetStatus?: ProductFormData["status"]) {
    setBusy(true);
    setError(null);
    let metadata: unknown;
    try {
      metadata = form.metadataJson.trim() ? JSON.parse(form.metadataJson) : {};
    } catch (err) {
      setError(`Invalid metadata JSON: ${err instanceof Error ? err.message : "parse error"}`);
      setBusy(false);
      return;
    }

    const payload = {
      slug: form.slug || undefined,
      category_id: form.categoryId,
      title: form.title,
      subtitle: form.subtitle || null,
      short_description: form.shortDescription || null,
      description: form.description,
      cover_url: form.coverUrl || null,
      gallery: form.gallery,
      price_cents: form.priceCents,
      compare_at_price_cents: form.compareAtPriceCents,
      currency: form.currency,
      product_type: form.productType,
      status: targetStatus ?? form.status,
      featured: form.featured,
      tags: form.tags,
      metadata,
      stock_count: form.stockCount,
      demo_url: form.demoUrl || null,
      preview_files: form.previewFiles,
      download_files: form.downloadFiles,
    };

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/market/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/market/products/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        setBusy(false);
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
      if (targetStatus) update("status", targetStatus);
      if (mode === "create" && data.product?.id) {
        router.replace(`/admin/market/${data.product.id}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit" || !form.id) return;
    if (!confirm("Delete this product permanently?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/market/products/${form.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `HTTP ${res.status}`);
        setBusy(false);
        return;
      }
      router.replace("/admin/market");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
      setBusy(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const u = await uploadFile(f, "cover");
      if (u.url) update("coverUrl", u.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    }
    e.target.value = "";
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      try {
        const u = await uploadFile(f, "gallery");
        if (u.url) update("gallery", [...form.gallery, u.url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "upload failed");
      }
    }
    e.target.value = "";
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "previewFiles" | "downloadFiles",
    slot: "preview" | "download",
  ) {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      try {
        const u = await uploadFile(f, slot);
        const { url: _url, ...productFile } = u;
        void _url;
        update(field, [...form[field], productFile]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "upload failed");
      }
    }
    e.target.value = "";
  }

  function removeFile(field: "previewFiles" | "downloadFiles", key: string) {
    update(
      field,
      form[field].filter((f) => f.r2_key !== key),
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        {/* Title */}
        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="React Server Components — the field guide"
            className={inputCls + " text-[22px] font-serif"}
          />
        </Field>

        <Field label="Subtitle (optional)">
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="One-line hook"
            className={inputCls + " font-serif"}
          />
        </Field>

        <Field label="Short description (card / listing)">
          <textarea
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            rows={2}
            placeholder="≤ 200 chars; appears on cards"
            className={inputCls}
          />
        </Field>

        <Field
          label={
            <span className="flex items-baseline justify-between">
              <span>Description (markdown)</span>
              <span className="text-ink-faint">
                {form.description.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </span>
          }
        >
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={20}
            placeholder={"## What's inside\n\nMarkdown body — H2 sections, code blocks, callouts."}
            className="min-h-[400px] rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-mono text-[14px] leading-[1.7] text-ink focus:border-ember focus:outline-none"
          />
        </Field>

        {/* Cover + gallery */}
        <Field label="Cover image">
          {form.coverUrl ? (
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverUrl}
                alt="cover"
                className="h-32 w-32 rounded-md border border-[var(--line)] object-cover"
              />
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={form.coverUrl}
                  onChange={(e) => update("coverUrl", e.target.value)}
                  className={inputCls + " text-[12px]"}
                />
                <button
                  type="button"
                  onClick={() => update("coverUrl", "")}
                  className="self-start text-[11px] text-ink-faint hover:text-[#C24A1F]"
                >
                  remove
                </button>
              </div>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={!form.id}
              className="font-mono text-[12px] text-ink-soft"
            />
          )}
          {!form.id && (
            <p className="mt-1 font-mono text-[10px] text-ink-faint">
              Save as draft first to enable uploads
            </p>
          )}
        </Field>

        <Field label="Gallery images">
          {form.gallery.length > 0 && (
            <div className="mb-2 grid grid-cols-4 gap-2">
              {form.gallery.map((url, i) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`gallery ${i + 1}`}
                    className="aspect-square w-full rounded-md border border-[var(--line)] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "gallery",
                        form.gallery.filter((g) => g !== url),
                      )
                    }
                    className="absolute right-1 top-1 rounded bg-ink/80 px-1 text-[10px] text-paper-pure"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={!form.id}
            className="font-mono text-[12px] text-ink-soft"
          />
        </Field>

        {/* Preview + download files */}
        <Field label="Preview files (free download, sample chapter / theme screenshots / etc.)">
          <FileList
            files={form.previewFiles}
            onRemove={(k) => removeFile("previewFiles", k)}
          />
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e, "previewFiles", "preview")}
            disabled={!form.id}
            className="font-mono text-[12px] text-ink-soft"
          />
        </Field>

        <Field label="Download files (paid — only buyers can access)">
          <FileList
            files={form.downloadFiles}
            onRemove={(k) => removeFile("downloadFiles", k)}
            sensitive
          />
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e, "downloadFiles", "download")}
            disabled={!form.id}
            className="font-mono text-[12px] text-ink-soft"
          />
        </Field>

        <Field label="Metadata (JSON — category-specific fields)">
          <textarea
            value={form.metadataJson}
            onChange={(e) => update("metadataJson", e.target.value)}
            rows={5}
            placeholder={'{"pages": 220, "format": ["pdf","epub"], "language": "en"}'}
            className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-mono text-[13px] text-ink focus:border-ember focus:outline-none"
          />
          <p className="mt-1 font-mono text-[10px] text-ink-faint">
            Appears as a spec table on the product page. Examples in §AI_PUBLISHING / market lib.
          </p>
        </Field>

        {error && (
          <p className="font-mono text-[12px] text-[#C24A1F]">Error: {error}</p>
        )}
      </div>

      {/* Sidebar */}
      <aside className="flex flex-col gap-5">
        <SidebarCard label="Status">
          <div className="flex flex-wrap gap-1.5">
            {(["draft", "published", "archived"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update("status", s)}
                className={[
                  "rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors",
                  form.status === s
                    ? "border-ember bg-ember text-paper-pure"
                    : "border-[var(--line)] text-ink-soft hover:border-ember",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard label="Category">
          <select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className={inputCls + " font-mono text-[13px]"}
          >
            <option value="">— pick —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </SidebarCard>

        <SidebarCard label="Slug">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto from title"
            className={inputCls + " font-mono text-[13px]"}
          />
        </SidebarCard>

        <SidebarCard label="Price (USD base)">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-ink-faint">$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.priceCents / 100}
              onChange={(e) => update("priceCents", Math.round(Number(e.target.value) * 100))}
              className={inputCls + " font-mono text-[13px]"}
            />
          </div>
          <label className="mt-2 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
            Compare at
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.compareAtPriceCents ? form.compareAtPriceCents / 100 : ""}
              onChange={(e) =>
                update(
                  "compareAtPriceCents",
                  e.target.value ? Math.round(Number(e.target.value) * 100) : null,
                )
              }
              placeholder="(optional)"
              className="flex-1 rounded border border-[var(--line)] bg-paper-pure px-2 py-1 font-mono text-[12px]"
            />
          </label>
        </SidebarCard>

        <SidebarCard label="Stock">
          <input
            type="number"
            min={0}
            value={form.stockCount}
            onChange={(e) => update("stockCount", Math.max(0, Number(e.target.value)))}
            className={inputCls + " font-mono text-[13px]"}
          />
        </SidebarCard>

        <SidebarCard label="Type">
          <div className="flex gap-1.5">
            {(["digital", "physical", "service"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("productType", t)}
                className={[
                  "flex-1 rounded-md border py-1.5 font-mono text-[11px] uppercase tracking-[0.06em]",
                  form.productType === t
                    ? "border-ember bg-ember text-paper-pure"
                    : "border-[var(--line)] text-ink-soft hover:border-ember",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard label="Demo URL (optional)">
          <input
            type="url"
            value={form.demoUrl}
            onChange={(e) => update("demoUrl", e.target.value)}
            placeholder="https://demo.example.com"
            className={inputCls + " font-mono text-[12px]"}
          />
        </SidebarCard>

        <SidebarCard label="Tags (comma-separated)">
          <input
            type="text"
            value={form.tags.join(", ")}
            onChange={(e) =>
              update(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="react, ssr, fullstack"
            className={inputCls + " font-mono text-[13px]"}
          />
        </SidebarCard>

        <SidebarCard label="">
          <label className="flex items-center gap-2 font-mono text-[12px] text-ink-soft">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Featured on /market homepage
          </label>
        </SidebarCard>

        <div className="flex flex-col gap-2 border-t border-[var(--line-soft)] pt-5">
          <button
            type="button"
            onClick={() => save()}
            disabled={busy || !form.title.trim() || !form.categoryId}
            className="rounded-md bg-ink px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
          >
            {busy ? "Saving…" : mode === "create" ? "Create draft" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={busy || !form.title.trim() || !form.categoryId || !form.description.trim()}
            className="rounded-md border border-ember bg-ember-soft px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ember-deep transition-colors hover:bg-ember hover:text-paper-pure disabled:opacity-60"
          >
            Save & publish
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-md border border-[var(--line-soft)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:border-[#C24A1F] hover:text-[#C24A1F]"
            >
              Delete product
            </button>
          )}
          {savedAt && (
            <p className="font-mono text-[11px] text-ink-faint">Saved at {savedAt}</p>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-md border border-[var(--line)] bg-paper-pure px-3 py-2 text-[14px] text-ink focus:border-ember focus:outline-none";

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </label>
      {children}
    </div>
  );
}

function SidebarCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-paper-pure p-4">
      {label && (
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function FileList({
  files,
  onRemove,
  sensitive = false,
}: {
  files: ProductFile[];
  onRemove: (key: string) => void;
  sensitive?: boolean;
}) {
  if (files.length === 0) return null;
  return (
    <ul className="mb-2 space-y-1">
      {files.map((f) => (
        <li
          key={f.r2_key}
          className="flex items-center justify-between gap-3 rounded border border-[var(--line-soft)] bg-paper px-3 py-2 font-mono text-[12px]"
        >
          <span className="truncate text-ink">{f.name}</span>
          <span className="shrink-0 text-ink-faint">
            {Math.round(f.size / 1024)} KB
            {sensitive && " · 🔒"}
          </span>
          <button
            type="button"
            onClick={() => onRemove(f.r2_key)}
            className="text-ink-faint hover:text-[#C24A1F]"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
