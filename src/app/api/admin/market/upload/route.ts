import { NextResponse } from "next/server";
import {
  isR2Configured,
  r2Head,
  r2PublicOrSignedUrl,
  r2Upload,
} from "@/lib/r2";
import { verifyBearer, verifySessionCookie } from "@/features/admin/lib/auth";

export const runtime = "nodejs";

/**
 * Multipart upload to R2. Used by the admin product editor for cover/gallery/
 * preview/download files.
 *
 * Form fields:
 *   file        — the actual File (required)
 *   product_id  — uuid for grouping (required)
 *   slot        — "cover" | "gallery" | "preview" | "download" (required)
 *
 * Response: { key, url, size, mime, name }
 */
export async function POST(req: Request) {
  const ok = (await verifySessionCookie()) || verifyBearer(req);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isR2Configured()) {
    return NextResponse.json({ error: "r2_not_configured" }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  const productId = String(form.get("product_id") ?? "").trim();
  const slot = String(form.get("slot") ?? "").trim();
  if (!productId || !/^[0-9a-f-]{36}$/i.test(productId)) {
    return NextResponse.json({ error: "invalid_product_id" }, { status: 400 });
  }
  if (!["cover", "gallery", "preview", "download"].includes(slot)) {
    return NextResponse.json({ error: "invalid_slot" }, { status: 400 });
  }

  // Safety: cap file size at 100MB per upload. Larger goes via direct presigned URL (future).
  const MAX_BYTES = 100 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large", max_bytes: MAX_BYTES }, { status: 413 });
  }

  // Slug the filename to keep R2 keys readable.
  const cleanName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  const key = `products/${productId}/${slot}/${Date.now()}-${cleanName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2Upload({
      key,
      body: buffer,
      contentType: file.type || "application/octet-stream",
      contentLength: file.size,
      cacheControl:
        slot === "cover" || slot === "gallery"
          ? "public, max-age=31536000, immutable"
          : "private, max-age=0",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "upload_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }

  // Return a URL the admin UI can preview. For cover/gallery, prefer public URL.
  const url =
    slot === "cover" || slot === "gallery" || slot === "preview"
      ? await r2PublicOrSignedUrl(key)
      : null;

  // Optional sanity: confirm object landed
  await r2Head(key);

  return NextResponse.json({
    key,
    url,
    name: file.name,
    size: file.size,
    mime: file.type,
  });
}
