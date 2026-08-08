"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, AlertTriangle, CheckCircle2, Search, ArrowRight } from "lucide-react";
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
        <Link2 className="h-5 w-5 text-indigo-300" strokeWidth={2.25} aria-hidden="true" />
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
          className="min-h-[48px] flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-xs text-white placeholder-slate-500 transition focus-visible:border-[#38bdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]/40"
        />
        <button
          type="submit"
          disabled={stage.step === "resolving" || !url}
          className="min-h-[48px] rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {stage.step === "resolving" ? "Extracting..." : "Resolve Link →"}
        </button>
      </form>

      {stage.step === "error" && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          {stage.message}
        </p>
      )}

      {(stage.step === "preview" || stage.step === "saving") && (
        <div className="mt-4 glass-card rounded-2xl p-5 border border-indigo-500/30">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Resolved Catalog Entry
          </p>
          <GarmentChips data={stage.data} />
          <button
            type="button"
            onClick={() => handleSave(stage.data)}
            disabled={stage.step === "saving"}
            className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#38bdf8] px-6 text-xs font-black uppercase tracking-wider text-[#070c1a] shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            {stage.step === "saving" ? "Saving..." : "Save to Closet Board"}
            {stage.step !== "saving" && <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
          </button>

          {crossMatch?.status === "checking" && (
            <p className="mt-3 text-xs text-slate-400 animate-pulse">Checking Slaydar network for twin garments...</p>
          )}
          {crossMatch?.status === "found" && (
            <div className="mt-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-xs">
              <p className="flex items-center gap-1.5 font-extrabold text-indigo-300">
                <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                Someone else in the network owns this exact garment!
              </p>
              <p className="mt-1 text-slate-300">
                Owner <strong className="text-white">{crossMatch.garment.owner_id}</strong> has a{" "}
                <span className="capitalize">{crossMatch.garment.color} {crossMatch.garment.category}</span>
                {crossMatch.garment.brand ? ` (${crossMatch.garment.brand})` : ""}, condition score{" "}
                <strong className="text-[#38bdf8]">{crossMatch.garment.condition_score}</strong>.
              </p>
              <Link
                href={`/listing/${crossMatch.garment.garment_id}`}
                className="mt-2 inline-flex items-center gap-1 font-extrabold text-indigo-300 underline hover:text-white"
              >
                View their resale listing
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}

      {stage.step === "saved" && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          Saved to closet board (<code className="text-white">{stage.garmentId}</code>)
        </p>
      )}
    </div>
  );
}
