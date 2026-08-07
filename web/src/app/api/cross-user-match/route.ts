import { NextRequest, NextResponse } from "next/server";
import { OTHER_DEMO_OWNER_IDS } from "@/lib/constants";
import type { Garment } from "@/lib/mock-garments";
import type { ExtractedGarment } from "@/lib/types";
import { fetchCloset } from "@/lib/backend";

function isSameItem(a: ExtractedGarment, b: Garment): boolean {
  const sameCategory = a.category.trim().toLowerCase() === b.category.trim().toLowerCase();
  const sameColor = a.color.trim().toLowerCase() === b.color.trim().toLowerCase();
  const sameBrand = !a.brand || !b.brand || a.brand.trim().toLowerCase() === b.brand.trim().toLowerCase();
  return sameCategory && sameColor && sameBrand;
}

/**
 * Tier 2 "someone else has this exact item" match. No real cross-owner search exists —
 * this checks a small hardcoded list of known demo owners' closets (see constants.ts)
 * and returns the first item that plausibly matches on category/color/brand.
 */
export async function POST(req: NextRequest) {
  const { item, excludeOwnerId }: { item: ExtractedGarment; excludeOwnerId?: string } = await req.json();

  const candidates = OTHER_DEMO_OWNER_IDS.filter((id) => id !== excludeOwnerId);

  for (const ownerId of candidates) {
    const closet = await fetchCloset(ownerId);
    if (!closet) continue; // one demo owner's closet being unreachable shouldn't fail the whole check
    const match = closet.find((g) => isSameItem(item, g));
    if (match) {
      return NextResponse.json({ match });
    }
  }

  return NextResponse.json({ match: null });
}
