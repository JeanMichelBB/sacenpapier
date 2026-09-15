import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const bagPng = await readFile(join(process.cwd(), "public/img/shopping-bag.png"));
  const bagSrc = `data:image/png;base64,${bagPng.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bagSrc} width={72} height={72} alt="" />
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.02em" }}>
            sacenpapier.org
          </div>
        </div>
        <div style={{ fontSize: 32, color: "#a1a1aa", maxWidth: 900, lineHeight: 1.4 }}>
          A collection of personal projects — web apps, infra, and experiments.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {["x", "PopRoom", "BotWhy", "Aperçu"].map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 24,
                color: "#d4d4d8",
                border: "1px solid #27272a",
                borderRadius: 12,
                padding: "10px 20px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
