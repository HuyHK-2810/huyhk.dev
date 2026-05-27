/**
 * Cloudflare R2 storage — S3-compatible.
 *
 * Why R2: free egress. For digital downloads we'd otherwise pay $0.30/GB on
 * Vercel Blob. R2 = $0/GB egress + $0.015/GB-month storage.
 *
 * Setup (one time):
 *   1. dash.cloudflare.com → R2 → "Create bucket" → name (e.g. "huyhk-market")
 *   2. R2 → "Manage R2 API Tokens" → Create → permission "Object Read & Write",
 *      bucket scope = your bucket → copy credentials (only shown once)
 *   3. .env.local:
 *        R2_ACCOUNT_ID=<cloudflare account id>
 *        R2_ACCESS_KEY_ID=<access key>
 *        R2_SECRET_ACCESS_KEY=<secret>
 *        R2_BUCKET=huyhk-market
 *        # Optional custom domain bound to bucket (e.g. cdn.huyhk.dev) for public read
 *        R2_PUBLIC_BASE_URL=https://cdn.huyhk.dev
 *
 * Storage key scheme:
 *   products/<productId>/cover/<filename>      — hero / card image (public read)
 *   products/<productId>/gallery/<filename>    — additional images (public read)
 *   products/<productId>/preview/<filename>    — public preview (free download)
 *   products/<productId>/download/<filename>   — paid download (signed-URL only)
 *
 * Server-only — never import from a client component.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = process.env.R2_PUBLIC_BASE_URL;

let _client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _client;
}

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

export function getR2Bucket(): string | null {
  return bucket ?? null;
}

// ─────────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────────

export type UploadInput = {
  key: string;                  // e.g. "products/<id>/download/book.pdf"
  body: Buffer | Uint8Array | Blob | ReadableStream | string;
  contentType: string;
  contentLength?: number;
  cacheControl?: string;
};

export async function r2Upload(input: UploadInput): Promise<{ key: string }> {
  const client = getR2Client();
  if (!client || !bucket) throw new Error("R2 not configured");

  // ReadableStream isn't directly supported by AWS SDK in all environments;
  // pass through known types only.
  const body =
    input.body instanceof Blob
      ? new Uint8Array(await input.body.arrayBuffer())
      : (input.body as Buffer | Uint8Array | string);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: body,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
      CacheControl: input.cacheControl,
    }),
  );

  return { key: input.key };
}

// ─────────────────────────────────────────────────────────────────
// Signed URL for paid downloads (private bucket objects)
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a presigned GET URL. Default TTL 1 hour — short enough that links
 * shared accidentally don't grant indefinite access; long enough that a buyer
 * on slow connection completes the download.
 */
export async function r2SignedDownloadUrl(
  key: string,
  opts?: { expiresInSec?: number; downloadFilename?: string },
): Promise<string> {
  const client = getR2Client();
  if (!client || !bucket) throw new Error("R2 not configured");

  const expiresIn = opts?.expiresInSec ?? 3600;
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: opts?.downloadFilename
      ? `attachment; filename="${encodeURIComponent(opts.downloadFilename)}"`
      : undefined,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

// ─────────────────────────────────────────────────────────────────
// Public URL (for cover/gallery/preview when bucket has public read)
// ─────────────────────────────────────────────────────────────────

/**
 * Return a public URL when R2_PUBLIC_BASE_URL is configured (i.e. you bound a
 * custom domain to the bucket via Cloudflare). Falls back to a signed URL.
 */
export async function r2PublicOrSignedUrl(key: string): Promise<string> {
  if (publicBase) {
    return `${publicBase.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
  }
  return r2SignedDownloadUrl(key, { expiresInSec: 86_400 }); // 24h for "public" use
}

// ─────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────

export async function r2Delete(key: string): Promise<void> {
  const client = getR2Client();
  if (!client || !bucket) throw new Error("R2 not configured");
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// ─────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────

export type R2Object = {
  key: string;
  size: number;
  lastModified: Date;
};

export async function r2List(prefix: string): Promise<R2Object[]> {
  const client = getR2Client();
  if (!client || !bucket) return [];
  const result = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  );
  return (result.Contents ?? []).map((o) => ({
    key: o.Key!,
    size: o.Size ?? 0,
    lastModified: o.LastModified ?? new Date(0),
  }));
}

// ─────────────────────────────────────────────────────────────────
// Head (check existence + size + mime)
// ─────────────────────────────────────────────────────────────────

export async function r2Head(key: string): Promise<R2Object | null> {
  const client = getR2Client();
  if (!client || !bucket) return null;
  try {
    const result = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    return {
      key,
      size: result.ContentLength ?? 0,
      lastModified: result.LastModified ?? new Date(0),
    };
  } catch {
    return null;
  }
}
