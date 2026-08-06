"use client";

import { useState } from "react";
import type { Garment } from "@/lib/mock-garments";

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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
        Daily ritual
      </p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Check in</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Snap what you&apos;re wearing today.</p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50/50 p-10 text-center transition hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/10">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.previewUrl} alt="Selected check-in" className="h-40 rounded-lg object-cover" />
        ) : (
          <>
            <span className="text-3xl">✨</span>
            <span className="mt-2 text-sm font-semibold">Click to choose a photo</span>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">just today&apos;s outfit</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      </label>

      {photo && stage.step === "select" && (
        <button
          type="button"
          onClick={handleFindMatch}
          className="mt-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:shadow-lg"
        >
          Find match
        </button>
      )}

      {stage.step === "matching" && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Matching against your closet…</p>
      )}

      {stage.step === "review" && (
        <div className="mt-6">
          {stage.matched ? (
            <div className="rounded-xl bg-white/70 p-4 shadow-sm dark:bg-white/5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Slaydar thinks this is</p>
              <p className="mt-1 text-sm font-bold capitalize">
                {stage.matched.color} {stage.matched.category}
                {stage.matched.brand ? ` (${stage.matched.brand})` : ""}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirm(stage.matched as Garment)}
                  className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm"
                >
                  Yep, that&apos;s it
                </button>
                <button
                  type="button"
                  onClick={() => setStage({ step: "review", matched: null, closet: stage.closet })}
                  className="rounded-full border-2 border-purple-200 bg-white px-4 py-1.5 text-xs font-bold text-purple-700 dark:border-white/20 dark:bg-white/5 dark:text-white"
                >
                  Not this one
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stage.closet.length === 0
                  ? "Your closet is empty. Upload some garments first."
                  : "Pick the item you're actually wearing:"}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {stage.closet.map((g) => (
                  <button
                    key={g.garment_id}
                    type="button"
                    onClick={() => handleConfirm(g)}
                    className="rounded-xl border border-purple-100 bg-white/70 px-4 py-2 text-left text-sm font-medium capitalize shadow-sm transition hover:border-fuchsia-300 dark:border-white/10 dark:bg-white/5"
                  >
                    {g.color} {g.category}
                    {g.brand ? ` (${g.brand})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {stage.step === "checking-in" && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Checking in…</p>
      )}
      {stage.step === "roasting" && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Slaydar is thinking of something to say…</p>
      )}

      {stage.step === "done" && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-xl dark:bg-white/10">
          <p className="text-xs font-bold tracking-wide text-purple-500 uppercase">Slaydar says</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-fuchsia-100 px-2 py-1 text-xs font-bold text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              worn {stage.garment.wear_count}x
            </span>
            <p className="text-sm text-gray-900 dark:text-gray-100">{stage.roast}</p>
          </div>
        </div>
      )}

      {stage.step === "error" && <p className="mt-4 text-sm text-red-500">{stage.message}</p>}
    </main>
  );
}
