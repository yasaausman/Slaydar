import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { fetchCloset } from "@/lib/backend";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getCloset(): Promise<Garment[]> {
  return (await fetchCloset(DEMO_OWNER_ID)) ?? mockGarments;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'photo' file in form data" }, { status: 400 });
  }

  const closet = await getCloset();
  if (closet.length === 0) {
    return NextResponse.json({ garment_id: null, matched: null });
  }

  const closetDescription = closet
    .map(
      (g) =>
        `- id: ${g.garment_id} | ${g.category}, ${g.color}, ${g.material}${g.brand ? `, ${g.brand}` : ""}`
    )
    .join("\n");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `Here is the wearer's closet:\n${closetDescription}\n\nThe attached photo shows a garment they're wearing today. Pick the garment_id from the list above that best matches the photo. If none of them plausibly match, use "none".`,
      },
      { inlineData: { mimeType: file.type || "image/jpeg", data: base64Data } },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          garment_id: {
            type: Type.STRING,
            format: "enum",
            enum: [...closet.map((g) => g.garment_id), "none"],
          },
        },
        required: ["garment_id"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    return NextResponse.json({ error: "Gemini returned no output" }, { status: 502 });
  }

  const { garment_id } = JSON.parse(text) as { garment_id: string };
  const matched = garment_id === "none" ? null : closet.find((g) => g.garment_id === garment_id) ?? null;

  return NextResponse.json({ garment_id: matched?.garment_id ?? null, matched, closet });
}
