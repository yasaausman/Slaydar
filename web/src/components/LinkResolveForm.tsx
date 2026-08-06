"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_OWNER_ID } from "@/lib/constants";
import type { Garment } from "@/lib/mock-garments";
import type { ExtractedGarment } from "@/lib/types";
import GarmentChips from "@/components/GarmentChips";

type Stage =
  | { step: "idle" }
  | { step: "resolving" }
  | { step: "preview"; data: ExtractedGarment }
  | { step: "saving"; data: ExtractedGarment }
  | { step: "saved"; garmentId: string }
  | { step: "error"; message: string };

type CrossMatch = { status: "checking" } | { status: "found"; garment: Garment } | { status: "none" };

export default function LinkResolveForm() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>({ step: "idle" });
  const [crossMatch, setCrossMatch] = useState<CrossMatch | null>(null);

  async function checkCrossUserMatch(item: ExtractedGarment) {
    setCrossMatch({ status: "checking" });
    try {
      const res = await fetch("/api/cross-user-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, excludeOwnerId: DEMO_OWNER_ID }),
      });
      const body = await res.json();
      setCrossMatch(body.match ? { status: "found", garment: body.match } : { status: "none" });
    } catch {
      setCrossMatch({ status: "none" });
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setStage({ step: "resolving" });
    setCrossMatch(null);
    try {
      const res = await fetch("/api/resolve-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Request failed with ${res.status}`);
      setStage({ step: "preview", data: body });
      checkCrossUserMatch(body);
    } catch (err) {
      setStage({ step: "error", message: err instanceof Error ? err.message : "Resolving link failed" });
    }
  }

  async function handleSave(data: ExtractedGarment) {
    setStage({ step: "saving", data });
    try {
      const res = await fetch("/api/garments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: DEMO_OWNER_ID, ...data }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Saving to closet failed with ${res.status}`);
      setStage({ step: "saved", garmentId: body.garment_id });
      setUrl("");
    } catch (err) {
      setStage({ step: "error", message: err instanceof Error ? err.message : "Save failed" });
    }
  }

  return (
    <div className="mt-10 border-t border-purple-100 pt-6 dark:border-white/10">
      <h2 className="text-sm font-bold text-purple-700 dark:text-purple-300">🔗 Or paste a product link</h2>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Skip the photo. Paste a retailer product page and Slaydar resolves it into a catalog entry.
      </p>

      <form onSubmit={handleResolve} className="mt-3 flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://retailer.example.com/product/..."
          className="flex-1 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm dark:border-white/20 dark:bg-white/5"
        />
        <button
          type="submit"
          disabled={stage.step === "resolving" || !url}
          className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stage.step === "resolving" ? "Resolving…" : "Resolve"}
        </button>
      </form>

      {stage.step === "error" && <p className="mt-3 text-sm text-red-500">{stage.message}</p>}

      {(stage.step === "preview" || stage.step === "saving") && (
        <div className="mt-4 rounded-xl bg-white/70 p-4 shadow-sm dark:bg-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Resolved to</p>
          <GarmentChips data={stage.data} />
          <button
            type="button"
            onClick={() => handleSave(stage.data)}
            disabled={stage.step === "saving"}
            className="mt-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-40"
          >
            {stage.step === "saving" ? "Saving…" : "Save to closet"}
          </button>

          {crossMatch?.status === "checking" && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Checking if anyone else has this…</p>
          )}
          {crossMatch?.status === "found" && (
            <div className="mt-3 rounded-lg border border-fuchsia-300 bg-fuchsia-50 p-3 text-xs dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10">
              <p className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                🔎 Someone else has this exact item
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                <strong>{crossMatch.garment.owner_id}</strong> owns a {crossMatch.garment.color}{" "}
                {crossMatch.garment.category}
                {crossMatch.garment.brand ? ` (${crossMatch.garment.brand})` : ""}, condition score{" "}
                {crossMatch.garment.condition_score}.
              </p>
              <Link
                href={`/listing/${crossMatch.garment.garment_id}`}
                className="mt-1 inline-block font-medium text-fuchsia-700 underline dark:text-fuchsia-300"
              >
                View their listing
              </Link>
            </div>
          )}
        </div>
      )}

      {stage.step === "saved" && (
        <p className="mt-3 text-sm font-bold text-green-600">Saved to closet ({stage.garmentId})</p>
      )}
    </div>
  );
}
