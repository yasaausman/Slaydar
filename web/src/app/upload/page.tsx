"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_OWNER_ID } from "@/lib/constants";
import type { Garment } from "@/lib/mock-garments";
import type { ExtractedGarment } from "@/lib/types";
import LinkResolveForm from "@/components/LinkResolveForm";
import GarmentChips from "@/components/GarmentChips";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

type ExtractionResult =
  | { status: "pending" }
  | { status: "saving"; data: ExtractedGarment }
  | { status: "saved"; data: ExtractedGarment; garmentId: string }
  | { status: "error"; message: string };

type CrossMatch = { status: "checking" } | { status: "found"; garment: Garment } | { status: "none" };

export default function UploadPage() {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<Record<string, ExtractionResult>>({});
  const [crossMatches, setCrossMatches] = useState<Record<string, CrossMatch>>({});

  async function checkCrossUserMatch(key: string, item: ExtractedGarment) {
    setCrossMatches((prev) => ({ ...prev, [key]: { status: "checking" } }));
    try {
      const res = await fetch("/api/cross-user-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, excludeOwnerId: DEMO_OWNER_ID }),
      });
      const body = await res.json();
      setCrossMatches((prev) => ({
        ...prev,
        [key]: body.match ? { status: "found", garment: body.match } : { status: "none" },
      }));
    } catch {
      setCrossMatches((prev) => ({ ...prev, [key]: { status: "none" } }));
    }
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleExtract() {
    setIsExtracting(true);
    setResults((prev) => {
      const next = { ...prev };
      for (const photo of photos) next[photo.previewUrl] = { status: "pending" };
      return next;
    });

    await Promise.all(
      photos.map(async (photo) => {
        try {
          const formData = new FormData();
          formData.append("photo", photo.file);
          const res = await fetch("/api/extract", { method: "POST", body: formData });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? `Request failed with ${res.status}`);
          }
          const data: ExtractedGarment = await res.json();
          setResults((prev) => ({ ...prev, [photo.previewUrl]: { status: "saving", data } }));

          const saveRes = await fetch("/api/garments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner_id: DEMO_OWNER_ID, ...data }),
          });
          if (!saveRes.ok) {
            const body = await saveRes.json().catch(() => ({}));
            throw new Error(body.error ?? `Saving to closet failed with ${saveRes.status}`);
          }
          const saved = await saveRes.json();
          setResults((prev) => ({
            ...prev,
            [photo.previewUrl]: { status: "saved", data, garmentId: saved.garment_id },
          }));
          checkCrossUserMatch(photo.previewUrl, data);
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [photo.previewUrl]: {
              status: "error",
              message: err instanceof Error ? err.message : "Extraction failed",
            },
          }));
        }
      })
    );

    setIsExtracting(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
        Step one
      </p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Upload your closet</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Add a few photos of your clothes and Slaydar will tag each one.
      </p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50/50 p-10 text-center transition hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/5 dark:hover:bg-fuchsia-500/10">
        <span className="text-3xl">📸</span>
        <span className="mt-2 text-sm font-semibold">Click to choose photos</span>
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">or drag and drop</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </label>

      {photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => {
            const result = results[photo.previewUrl];
            return (
              <div key={photo.previewUrl} className="rounded-xl bg-white/60 p-2 shadow-sm dark:bg-white/5">
                <div className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={photo.file.name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${photo.file.name}`}
                  >
                    ×
                  </button>
                </div>
                {result?.status === "pending" && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tagging…</p>
                )}
                {result?.status === "saving" && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Saving to closet…</p>
                )}
                {result?.status === "error" && (
                  <p className="mt-2 text-xs text-red-500">{result.message}</p>
                )}
                {result?.status === "saved" && (
                  <>
                    <p className="mt-2 text-xs font-bold text-green-600">Saved ✓</p>
                    <GarmentChips data={result.data} />
                    {crossMatches[photo.previewUrl]?.status === "checking" && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Checking if anyone else has this…</p>
                    )}
                    {crossMatches[photo.previewUrl]?.status === "found" && (
                      <div className="mt-2 rounded-lg border border-fuchsia-300 bg-fuchsia-50 p-2 text-xs dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10">
                        {(() => {
                          const cm = crossMatches[photo.previewUrl];
                          if (cm.status !== "found") return null;
                          return (
                            <>
                              <p className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                                🔎 {cm.garment.owner_id} has this too
                              </p>
                              <Link
                                href={`/listing/${cm.garment.garment_id}`}
                                className="font-medium text-fuchsia-700 underline dark:text-fuchsia-300"
                              >
                                View their listing
                              </Link>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleExtract}
        disabled={photos.length === 0 || isExtracting}
        className="mt-6 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:shadow-lg hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isExtracting ? "Extracting…" : `Extract ${photos.length || ""} item${photos.length === 1 ? "" : "s"}`}
      </button>

      <LinkResolveForm />
    </main>
  );
}
