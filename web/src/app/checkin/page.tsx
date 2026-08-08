"use client";

import { useState } from "react";
import { Sparkles, ImageOff, Check, AlertTriangle, ArrowRight } from "lucide-react";
import type { Garment } from "@/lib/mock-garments";
import { isHeicFile } from "@/lib/is-heic";
import SlaydarAgentCard from "@/components/SlaydarAgentCard";

type Stage =
  | { step: "select" }
  | { step: "matching" }
  | { step: "review"; matched: Garment | null; closet: Garment[] }
  | { step: "checking-in" }
  | { step: "roasting"; garment: Garment }
  | { step: "done"; garment: Garment; roast: string }
  | { step: "error"; message: string };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckinPage() {
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(null);
  const [stage, setStage] = useState<Stage>({ step: "select" });

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setPhoto({ file, previewUrl: URL.createObjectURL(file) });
    setStage({ step: "select" });
  }

  async function handleFindMatch() {
    if (!photo) return;
    setStage({ step: "matching" });
    try {
      const formData = new FormData();
      formData.append("photo", photo.file);
      const res = await fetch("/api/match", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Match request failed with ${res.status}`);
      const data: { matched: Garment | null; closet: Garment[] } = await res.json();
      setStage({ step: "review", matched: data.matched, closet: data.closet ?? [] });
    } catch (err) {
      setStage({ step: "error", message: err instanceof Error ? err.message : "Match failed" });
    }
  }

  async function handleConfirm(garment: Garment) {
    setStage({ step: "checking-in" });
    try {
      const res = await fetch(`/api/garments/${garment.garment_id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worn_date: todayIso() }),
      });
      if (!res.ok) throw new Error(`Check-in failed with ${res.status}`);
      const updated: Garment = await res.json();

      setStage({ step: "roasting", garment: updated });
      const roastRes = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!roastRes.ok) throw new Error(`Roast request failed with ${roastRes.status}`);
      const { roast } = await roastRes.json();
      setStage({ step: "done", garment: updated, roast });
    } catch (err) {
      setStage({ step: "error", message: err instanceof Error ? err.message : "Check-in failed" });
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-[#38bdf8]">
          Step 2: Daily Ritual
        </span>
        <h1 className="font-display mt-2 text-5xl text-white sm:text-6xl">
          Outfit Check-in
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-300">
          Snap what you&apos;re wearing today. Slaydar matches it to your closet and delivers stat-backed judgment.
        </p>
      </div>

      {/* Outfit Dropzone */}
      <label className="mt-8 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 p-8 text-center transition-all hover:border-[#38bdf8] hover:bg-indigo-500/10 focus-within:ring-2 focus-within:ring-[#38bdf8]">
        {photo ? (
          isHeicFile(photo.file) ? (
            <div className="relative flex aspect-square h-44 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-indigo-500/10 p-3 text-center shadow-2xl">
              <ImageOff className="h-8 w-8 text-indigo-200" strokeWidth={2} aria-hidden="true" />
              <span className="line-clamp-2 text-[10px] break-all font-semibold text-indigo-200">
                {photo.file.name}
              </span>
              <span className="text-[9px] text-slate-400">no preview, still works</span>
            </div>
          ) : (
            <div className="relative aspect-square h-44 overflow-hidden rounded-2xl border-2 border-indigo-500/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="Selected OOTD check-in" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#38bdf8]">
                  Click to change photo
                </span>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-sky-300 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070c1a]">
                <Sparkles className="h-6 w-6 text-[#38bdf8]" strokeWidth={2.25} aria-hidden="true" />
              </div>
            </div>
            <span className="mt-4 text-base font-extrabold text-white">
              Choose today&apos;s outfit photo
            </span>
            <span className="mt-1 text-xs font-semibold text-slate-400">
              Snap your OOTD to trigger Slaydar judgment
            </span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      </label>

      {/* Find Match Button */}
      {photo && stage.step === "select" && (
        <button
          type="button"
          onClick={handleFindMatch}
          className="mt-6 min-h-[48px] w-full rounded-full bg-[#38bdf8] px-8 text-xs font-black uppercase tracking-wider text-[#070c1a] shadow-lg shadow-[#38bdf8]/20 transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
        >
          Find Match in Closet Vault →
        </button>
      )}

      {/* Loading Steps */}
      {stage.step === "matching" && (
        <div className="mt-6 glass-card rounded-2xl p-6 text-center border border-indigo-500/30">
          <span className="h-3 w-3 inline-block rounded-full bg-indigo-400 animate-ping mr-2" />
          <span className="text-sm font-extrabold text-indigo-300">
            Slaydar Vision AI is scanning your closet vault...
          </span>
        </div>
      )}

      {stage.step === "checking-in" && (
        <div className="mt-6 glass-card rounded-2xl p-6 text-center border border-amber-500/30">
          <span className="h-3 w-3 inline-block rounded-full bg-amber-400 animate-pulse mr-2" />
          <span className="text-sm font-extrabold text-amber-300">
            Logging wear history to DataHub...
          </span>
        </div>
      )}

      {stage.step === "roasting" && (
        <div className="mt-6 glass-card rounded-2xl p-6 text-center border border-[#38bdf8]/30">
          <span className="h-3 w-3 inline-block rounded-full bg-[#38bdf8] animate-ping mr-2" />
          <span className="text-sm font-extrabold text-[#38bdf8]">
            Slaydar is analyzing stats to compose your style judgment...
          </span>
        </div>
      )}

      {/* Review Match Step */}
      {stage.step === "review" && (
        <div className="mt-6 glass-panel rounded-3xl p-6 border border-white/10">
          {stage.matched ? (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                Slaydar AI Match Candidate
              </span>
              <h3 className="mt-2 text-2xl font-black capitalize text-white">
                {stage.matched.color} {stage.matched.category}
                {stage.matched.brand ? ` (${stage.matched.brand})` : ""}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-300">
                Material: {stage.matched.material} · Worn {stage.matched.wear_count}x previously
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirm(stage.matched as Garment)}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Yep, that&apos;s what I&apos;m wearing
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setStage({ step: "review", matched: null, closet: stage.closet })}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full glass-card border border-white/20 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Not this piece
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Select Garment Manually
              </span>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {stage.closet.length === 0
                  ? "Your closet vault is empty. Please upload garments first."
                  : "Pick the exact piece you are wearing today:"}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {stage.closet.map((g) => (
                  <button
                    key={g.garment_id}
                    type="button"
                    onClick={() => handleConfirm(g)}
                    className="glass-card glass-card-hover flex min-h-[48px] items-center justify-between rounded-xl px-5 text-left text-sm font-bold capitalize text-white transition border border-white/10 hover:border-[#38bdf8]/40"
                  >
                    <span>
                      {g.color} {g.category}
                      {g.brand ? ` (${g.brand})` : ""}
                    </span>
                    <span className="text-xs font-semibold text-[#38bdf8]">
                      Worn {g.wear_count}x →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done Step: Slaydar Agent Roast Card */}
      {stage.step === "done" && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#38bdf8]">
              Check-in Logged Successfully
            </span>
            <span className="text-xs font-bold text-slate-400">
              Updated Wear Count: {stage.garment.wear_count}x
            </span>
          </div>

          <SlaydarAgentCard
            statTag={`worn ${stage.garment.wear_count}x`}
            roastText={stage.roast}
          />
        </div>
      )}

      {/* Error State */}
      {stage.step === "error" && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 text-xs font-bold text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          {stage.message}
        </div>
      )}
    </main>
  );
}
