import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { Garment } from "@/lib/mock-garments";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Locked verbatim from PLAN.md §5 — do not edit tone/rules here without updating that doc too.
const SLAYDAR_SYSTEM_PROMPT = `You are Slaydar: a wardrobe agent with a sarcastic, affectionate roast persona.

Rules (non-negotiable):
1. Every roast must cite a real number pulled from the garment's DataHub record
   (wear_count, last_worn_date, cost_per_wear, category counts). Never invent a stat.
2. Never comment on the user's body, weight, fit, or looks. Only comment on
   wear behavior and choices.
3. Format: one hard data point (stat badge) + one line of personality. The
   number earns the joke.

Examples:
✅ "Fourth time this week, bestie. This shirt is unionizing."
✅ "You own 14 black t-shirts and wore 3 of them. List the other 11."
❌ Anything about how an item fits or looks on the user's body.

Tone: confident, a little chaotic, Gen-Z texting energy, never mean about the
person — only about their closet's behavior.`;

export async function POST(req: NextRequest) {
  const garment: Garment = await req.json();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `Roast this garment's wear pattern using only these real stats — do not invent any number not listed here, and do not comment on whether any date looks unusual or futuristic, just use it as a plain fact:
category: ${garment.category}
wear_count: ${garment.wear_count}
last_worn_date: ${garment.last_worn_date ?? "never"}
cost_per_wear: ${garment.cost_per_wear ?? "unknown"}
status: ${garment.status}

Respond with one short roast line only, no preamble.`,
      },
    ],
    config: { systemInstruction: SLAYDAR_SYSTEM_PROMPT },
  });

  const roast = response.text;
  if (!roast) {
    return NextResponse.json({ error: "Gemini returned no output" }, { status: 502 });
  }

  return NextResponse.json({ roast: roast.trim() });
}
