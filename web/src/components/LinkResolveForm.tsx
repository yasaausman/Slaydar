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
    <div className="mt-12 border-t border-white/10 pt-8">
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="Link Icon">
          🔗
        </span>
        <h2 className="text-base font-extrabold text-white">Or paste a retailer product link</h2>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-400">
        Skip uploading photos. Paste a retailer product page URL and Slaydar will extract garment details automatically.
      </p>

      <form onSubmit={handleResolve} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://retailer.example.com/product/..."
          className="min-h-[48px] flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-xs text-white placeholder-slate-500 transition focus:border-[#d9ff3b] focus:outline-none focus:ring-2 focus:ring-[#d9ff3b]/40"
        />
        <button
          type="submit"
          disabled={stage.step === "resolving" || !url}
          className="min-h-[48px] rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-fuchsia-500/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          {stage.step === "resolving" ? "Extracting..." : "Resolve Link →"}
        </button>
      </form>

      {stage.step === "error" && (
        <p className="mt-3 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          ⚠️ {stage.message}
        </p>
      )}

      {(stage.step === "preview" || stage.step === "saving") && (
        <div className="mt-4 glass-card rounded-2xl p-5 border border-fuchsia-500/30">
          <p className="text-xs font-extrabold uppercase tracking-widest text-fuchsia-400">
            Resolved Catalog Entry
          </p>
          <GarmentChips data={stage.data} />
          <button
            type="button"
            onClick={() => handleSave(stage.data)}
            disabled={stage.step === "saving"}
            className="mt-4 min-h-[44px] rounded-full bg-[#d9ff3b] px-6 text-xs font-black uppercase tracking-wider text-[#0d0714] shadow-md transition hover:scale-105 disabled:opacity-40"
          >
            {stage.step === "saving" ? "Saving..." : "Save to Closet Vault ✓"}
          </button>

          {crossMatch?.status === "checking" && (
            <p className="mt-3 text-xs text-slate-400 animate-pulse">Checking Slaydar network for twin garments...</p>
          )}
          {crossMatch?.status === "found" && (
            <div className="mt-4 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4 text-xs">
              <p className="font-extrabold text-fuchsia-300">
                🔎 Someone else in the network owns this exact garment!
              </p>
              <p className="mt-1 text-slate-300">
                Owner <strong className="text-white">{crossMatch.garment.owner_id}</strong> has a{" "}
                <span className="capitalize">{crossMatch.garment.color} {crossMatch.garment.category}</span>
                {crossMatch.garment.brand ? ` (${crossMatch.garment.brand})` : ""}, condition score{" "}
                <strong className="text-[#d9ff3b]">{crossMatch.garment.condition_score}</strong>.
              </p>
              <Link
                href={`/listing/${crossMatch.garment.garment_id}`}
                className="mt-2 inline-block font-extrabold text-fuchsia-300 underline hover:text-white"
              >
                View their resale listing →
              </Link>
            </div>
          )}
        </div>
      )}

      {stage.step === "saved" && (
        <p className="mt-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
          ✓ Saved to closet vault (<code className="text-white">{stage.garmentId}</code>)
        </p>
      )}
    </div>
  );
}
