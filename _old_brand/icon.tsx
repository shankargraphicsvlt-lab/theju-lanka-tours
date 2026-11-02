import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Kaushan Script, subset to the one glyph we draw. Null if Google Fonts can't be reached at build time. */
async function kaushanT(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Kaushan+Script&text=T")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Favicon from the logo: a "T" in Kaushan Script, white on deep emerald. */
export default async function Icon() {
  const font = await kaushanT();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#064e3b",
          borderRadius: 12,
          color: "#ffffff",
          fontSize: 56,
          paddingRight: 4,
          fontFamily: font ? "Kaushan Script" : "serif",
        }}
      >
        T
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Kaushan Script", data: font, style: "normal", weight: 400 }] : [] },
  );
}
