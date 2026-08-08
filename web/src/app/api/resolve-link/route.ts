import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { assertSafeUrl } from "@/lib/safe-fetch-url";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const garmentSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    color: { type: Type.STRING },
    material: { type: Type.STRING },
    brand: { type: Type.STRING, nullable: true },
    style_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["category", "color", "material", "style_tags"],
};

function extractPageSignal(html: string): string {
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    "";
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1]
  );

  return [`Title: ${title}`, `Description: ${description}`, ...jsonLdBlocks.map((b) => `JSON-LD: ${b}`)]
    .join("\n")
    .slice(0, 6000);
}

export async function POST(req: NextRequest) {
  const { url: rawUrl } = await req.json();
  if (typeof rawUrl !== "string" || !rawUrl) {
    return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
  }

  let url: URL;
  try {
    url = await assertSafeUrl(rawUrl);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid URL" }, { status: 400 });
  }

  let html: string;
  try {
    // Present as a real browser — a "SlaydarBot" UA gets 403'd by most retailers.
    // This bypasses naive bot checks (still no guarantee vs. aggressive walls like Akamai).
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    if (!res.ok) throw new Error(`Fetching the page failed with ${res.status}`);
    html = (await res.text()).slice(0, 300_000);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not fetch that URL" },
      { status: 502 }
    );
  }

  const pageSignal = extractPageSignal(html);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `This text was extracted from a retail product page. Identify the garment's category, color,
material, brand, and 1-3 style tags (choose from: casual, formal, streetwear, athletic, business, outdoor).
Make your best guess for any field not explicitly stated.

${pageSignal}`,
      },
    ],
    config: { responseMimeType: "application/json", responseSchema: garmentSchema },
  });

  const text = response.text;
  if (!text) {
    return NextResponse.json({ error: "Gemini returned no output" }, { status: 502 });
  }

  return NextResponse.json(JSON.parse(text));
}
