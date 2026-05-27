"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MarketCategory } from "@/lib/db/market";

export default function CategoriesEditor({
  initial,
}: {
  initial: MarketCategory[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCategory() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/market/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon.trim() || null,
          description: newDesc.trim() || null,
          sort_order: (categories.at(-1)?.sortOrder ?? 0) + 10,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setCategories((cs) => [...cs, json.category as MarketCategory]);
      setNewName("");
      setNewIcon("");
      setNewDesc("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  async function updateCategory(id: string, patch: Partial<MarketCategory>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/market/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patch.name,
          description: patch.description,
          icon: patch.icon,
          accent_color: patch.accentColor,
          sort_order: patch.sortOrder,
          is_active: patch.isActive,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(id: string, slug: string) {
    if (!confirm(`Delete "${slug}"? Products in this category will fail to load.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/market/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setCategories((cs) => cs.filter((c) => c.id !== id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing */}
      <ul className="overflow-hidden rounded-md border border-[var(--line)]">
        {categories.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-[1fr_120px_120px_60px_80px] items-center gap-3 border-b border-[var(--line-soft)] px-4 py-3 last:border-b-0 hover:bg-paper-pure"
          >
            <div>
              <div className="font-serif text-[16px] text-ink">{c.name}</div>
              {c.description && (
                <p className="mt-0.5 text-[13px] text-ink-soft">{c.description}</p>
              )}
            </div>
            <span className="font-mono text-[12px] text-ink-faint">/{c.slug}</span>
            <span className="font-mono text-[12px] text-ink-soft">{c.icon ?? "—"}</span>
            <span className="font-mono text-[12px] text-ink-faint">{c.sortOrder}</span>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => updateCategory(c.id, { isActive: !c.isActive })}
                className={[
                  "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]",
                  c.isActive
                    ? "border-ember bg-ember-soft text-ember-deep"
                    : "border-[var(--line)] text-ink-faint",
                ].join(" ")}
              >
                {c.isActive ? "active" : "off"}
              </button>
              <button
                type="button"
                onClick={() => deleteCategory(c.id, c.slug)}
                disabled={busy}
                className="font-mono text-[11px] text-ink-faint hover:text-[#C24A1F]"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* New */}
      <div className="rounded-md border border-dashed border-[var(--line)] bg-paper-pure p-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          + New category
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_2fr_auto]">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[14px]"
          />
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="icon (lucide)"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 font-mono text-[12px]"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="One-line description"
            className="rounded-md border border-[var(--line)] bg-paper px-3 py-2 text-[14px]"
          />
          <button
            type="button"
            onClick={createCategory}
            disabled={busy || !newName.trim()}
            className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure hover:bg-ember disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="font-mono text-[12px] text-[#C24A1F]">{error}</p>}
    </div>
  );
}
