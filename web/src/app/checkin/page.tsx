"use client";

import { useState } from "react";
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
        <span className="text-xs font-black uppercase tracking-widest text-[#d9ff3b]">
          Step 2: Daily Ritual
        </span>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Outfit Check-in
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-300">
          Snap what you&apos;re wearing today. Slaydar matches it to your closet and delivers stat-backed judgment.
        </p>
      </div>

      {/* Outfit Dropzone */}
      <label className="mt-8 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-fuchsia-500/40 bg-fuchsia-500/5 p-8 text-center transition-all hover:border-[#d9ff3b] hover:bg-fuchsia-500/10 focus-within:ring-2 focus-within:ring-[#d9ff3b]">
        {photo ? (
          isHeicFile(photo.file) ? (
            <div className="relative flex aspect-square h-44 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-fuchsia-500/40 bg-fuchsia-500/10 p-3 text-center shadow-2xl">
              <span className="text-3xl">🖼️</span>
              <span className="line-clamp-2 text-[10px] break-all font-semibold text-fuchsia-200">
                {photo.file.name}
              </span>
              <span className="text-[9px] text-slate-400">no preview, still works</span>
            </div>
          ) : (
            <div className="relative aspect-square h-44 overflow-hidden rounded-2xl border-2 border-fuchsia-500/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="Selected OOTD check-in" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d9ff3b]">
                  Click to change photo
                </span>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-lime-300 p-[2px] shadow-lg shadow-fuchsia-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0d0714]">
                <span className="text-2xl" role="img" aria-label="Sparkles Icon">
                  ✨
                </span>
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
          className="mt-6 min-h-[48px] w-full rounded-full bg-[#d9ff3b] px-8 text-xs font-black uppercase tracking-wider text-[#0d0714] shadow-lg shadow-[#d9ff3b]/20 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#d9ff3b]"
        >
          Find Match in Closet Vault →
        </button>
      )}

      {/* Loading Steps */}
      {stage.step === "matching" && (
        <div className="mt-6 glass-card rounded-2xl p-6 text-center border border-fuchsia-500/30">
          <span className="h-3 w-3 inline-block rounded-full bg-fuchsia-400 animate-ping mr-2" />
          <span className="text-sm font-extrabold text-fuchsia-300">
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
        <div className="mt-6 glass-card rounded-2xl p-6 text-center border border-[#d9ff3b]/30">
          <span className="h-3 w-3 inline-block rounded-full bg-[#d9ff3b] animate-ping mr-2" />
          <span className="text-sm font-extrabold text-[#d9ff3b]">
            Slaydar is analyzing stats to compose your style judgment...
          </span>
        </div>
      )}

      {/* Review Match Step */}
      {stage.step === "review" && (
        <div className="mt-6 glass-panel rounded-3xl p-6 border border-white/10">
          {stage.matched ? (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-fuchsia-400">
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
                  className="min-h-[44px] rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-fuchsia-500/20 transition hover:scale-105"
                >
                  Yep, that&apos;s what I&apos;m wearing ✓
                </button>
                <button
                  type="button"
                  onClick={() => setStage({ step: "review", matched: null, closet: stage.closet })}
                  className="min-h-[44px] rounded-full glass-card border border-white/20 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-white/10"
                >
                  Not this piece →
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
                    className="glass-card glass-card-hover flex min-h-[48px] items-center justify-between rounded-xl px-5 text-left text-sm font-bold capitalize text-white transition border border-white/10 hover:border-[#d9ff3b]/40"
                  >
                    <span>
                      {g.color} {g.category}
                      {g.brand ? ` (${g.brand})` : ""}
                    </span>
                    <span className="text-xs font-semibold text-[#d9ff3b]">
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#d9ff3b]">
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
        <div className="mt-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 text-xs font-bold text-rose-300">
          ⚠️ {stage.message}
        </div>
      )}
    </main>
  );
}
