import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "huyHK — fullstack engineer who started as a tester";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/brand/hkh-logo.png")
  );
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

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
          position: "relative",
        }}
      >
        {/* Top: stacked brand mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={120} height={120} alt="huyHK" />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              color: "#1a1a1a",
              letterSpacing: 1.5,
              display: "flex",
            }}
          >
            huyhk.dev
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.1,
              color: "#1a1a1a",
              letterSpacing: -1,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>fullstack engineer who started as a&nbsp;</span>
            <span style={{ fontStyle: "italic", color: "#FF6B35" }}>
              tester
            </span>
            <span>.</span>
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.4,
              color: "#4a4a4a",
              display: "flex",
            }}
          >
            Nine years in the trenches — currently building autonomous commerce
            at Penguin Secret Agency.
          </div>
        </div>

        {/* Bottom: meta row */}
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
            <span>react · next · node · python</span>
          </div>
          <div style={{ display: "flex" }}>huyhk.dev</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
