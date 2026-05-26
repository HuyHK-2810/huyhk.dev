"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PostFormData = {
  id?: string;
  slug: string;
  locale: "en" | "vi";
  title: string;
  excerpt: string;
  body: string;
  tagsCsv: string;
  status: "draft" | "published" | "archived";
  date: string;
};

type Props = {
  initial: PostFormData;
  mode: "create" | "edit";
};

function isoNow(): string {
  return new Date().toISOString();
}

export default function PostEditor({ initial, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormData>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(targetStatus?: PostFormData["status"]) {
    setBusy(true);
    setError(null);

    const tags = form.tagsCsv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      slug: form.slug || undefined,
      locale: form.locale,
      title: form.title,
      excerpt: form.excerpt || null,
      body: form.body,
      tags,
      status: targetStatus ?? form.status,
      date: form.date || isoNow(),
    };

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/posts/${form.id}`, {
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
      if (mode === "create" && data.post?.id) {
        router.replace(`/admin/posts/${data.post.id}`);
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
    if (!confirm("Delete this post permanently?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${form.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `HTTP ${res.status}`);
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
      setBusy(false);
    }
  }

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 220));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Why I still think like a tester…"
            className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-serif text-[22px] text-ink focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Excerpt
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            placeholder="One-line summary that shows up in the listing."
            rows={2}
            className="rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-serif text-[16px] text-ink-soft focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            <span>Body (markdown)</span>
            <span>
              {wordCount} words · {minutes} min
            </span>
          </label>
          <textarea
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder={"## Section heading\n\nYour markdown body here..."}
            rows={24}
            className="min-h-[500px] rounded-md border border-[var(--line)] bg-paper-pure px-4 py-3 font-mono text-[14px] leading-[1.7] text-ink focus:border-ember focus:outline-none"
          />
        </div>

        {error && (
          <p className="font-mono text-[12px] text-[#C24A1F]">Error: {error}</p>
        )}
      </div>

      <aside className="flex flex-col gap-5">
        <div className="rounded-md border border-[var(--line)] bg-paper-pure p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Status
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
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
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto from title"
            className="rounded-md border border-[var(--line)] bg-paper-pure px-3 py-2 font-mono text-[13px] text-ink focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Locale
          </label>
          <div className="flex gap-1.5">
            {(["en", "vi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => update("locale", l)}
                className={[
                  "flex-1 rounded-md border py-2 font-mono text-[12px] uppercase tracking-[0.08em]",
                  form.locale === l
                    ? "border-ember bg-ember text-paper-pure"
                    : "border-[var(--line)] text-ink-soft hover:border-ember",
                ].join(" ")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tagsCsv}
            onChange={(e) => update("tagsCsv", e.target.value)}
            placeholder="career, testing, fullstack"
            className="rounded-md border border-[var(--line)] bg-paper-pure px-3 py-2 font-mono text-[13px] text-ink focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            Date
          </label>
          <input
            type="datetime-local"
            value={form.date ? form.date.slice(0, 16) : ""}
            onChange={(e) => update("date", e.target.value ? new Date(e.target.value).toISOString() : "")}
            className="rounded-md border border-[var(--line)] bg-paper-pure px-3 py-2 font-mono text-[13px] text-ink focus:border-ember focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--line-soft)] pt-5">
          <button
            type="button"
            onClick={() => save()}
            disabled={busy || !form.title.trim() || !form.body.trim()}
            className="rounded-md bg-ink px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-paper-pure transition-all hover:-translate-y-px hover:bg-ember disabled:opacity-60"
          >
            {busy ? "Saving…" : mode === "create" ? "Create draft" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={busy || !form.title.trim() || !form.body.trim()}
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
              Delete post
            </button>
          )}
          {savedAt && (
            <p className="font-mono text-[11px] text-ink-faint">
              Saved at {savedAt}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
