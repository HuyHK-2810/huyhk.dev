import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPost, getPostSlugs } from "@/lib/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  return [
    {
      id: "main",
      alt: post?.title ?? "huyHK writing",
      contentType,
      size,
    },
  ];
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function PostOG({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  const logoBuffer = await readFile(
    join(process.cwd(), "public/brand/hkh-logo.png"),
  );
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const title = post?.title ?? "huyhk.dev";
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "";
  const tagsLine = post?.tags?.slice(0, 4).join("  ·  ") ?? "react · next · node · python";
  const reading = post?.readingMinutes ? `${post.readingMinutes} min read` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#FAF8F5",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={64} height={64} alt="huyHK" />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              color: "#1a1a1a",
              letterSpacing: 1.5,
              display: "flex",
            }}
          >
            huyhk.dev / writing
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              color: "#C24A1F",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              display: "flex",
              gap: 18,
            }}
          >
            {date && <span>{date}</span>}
            {reading && <span>{reading}</span>}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 52 : 64,
              lineHeight: 1.1,
              color: "#1a1a1a",
              letterSpacing: -1,
              display: "flex",
            }}
          >
            {title}
          </div>
          {post?.excerpt && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                color: "#4a4a4a",
                display: "flex",
                maxWidth: 980,
              }}
            >
              {post.excerpt}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 18,
            color: "#8a8a8a",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: "#FF6B35",
                display: "flex",
              }}
            />
            <span>{tagsLine}</span>
          </div>
          <div style={{ display: "flex" }}>Hồ Khắc Huy</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
