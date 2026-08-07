import type { Garment } from "@/lib/mock-garments";

const API_BASE_URL = process.env.API_BASE_URL;

// ngrok free tier shows an HTML interstitial for browser-looking requests;
// this header skips it so we always get real JSON back.
const HEADERS = { "ngrok-skip-browser-warning": "true" };

/** Fetches one owner's closet directly from the backend. Returns null on any failure
 * (no backend configured, network error, non-2xx) so callers can decide their own fallback. */
export async function fetchCloset(ownerId: string): Promise<Garment[] | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/closet/${ownerId}`, { cache: "no-store", headers: HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetches a single garment directly from the backend. Returns null on any failure. */
export async function fetchGarment(garmentId: string): Promise<Garment | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/garments/${garmentId}`, { cache: "no-store", headers: HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
