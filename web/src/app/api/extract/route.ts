import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_PROMPT = `You are looking at a photo of a single clothing item.
Identify its category, color, material, brand (if visible on a label/logo, else null),
and 1-3 style tags (choose from: casual, formal, streetwear, athletic, business, outdoor).
If you are unsure of a field, make your best guess rather than leaving it empty.`;

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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'photo' file in form data" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { text: EXTRACTION_PROMPT },
      { inlineData: { mimeType: file.type || "image/jpeg", data: base64Data } },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: garmentSchema,
    },
  });

  const text = response.text;
  if (!text) {
    return NextResponse.json({ error: "Gemini returned no output" }, { status: 502 });
  }

  const extracted = JSON.parse(text);
  return NextResponse.json(extracted);
}
