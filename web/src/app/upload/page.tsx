"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, ImageOff, X, AlertTriangle, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { DEMO_OWNER_ID } from "@/lib/constants";
import type { Garment } from "@/lib/mock-garments";
import type { ExtractedGarment } from "@/lib/types";
import LinkResolveForm from "@/components/LinkResolveForm";
import GarmentChips from "@/components/GarmentChips";
import { isHeicFile } from "@/lib/is-heic";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

type ExtractionResult =
  | { status: "pending" }
  | { status: "saving"; data: ExtractedGarment }
  | { status: "saved"; data: ExtractedGarment; garmentId: string }
  | { status: "error"; message: string; data?: ExtractedGarment };

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
        let extracted: ExtractedGarment | undefined;
        try {
          const formData = new FormData();
          formData.append("photo", photo.file);
          const res = await fetch("/api/extract", { method: "POST", body: formData });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? `Request failed with ${res.status}`);
          }
          const data: ExtractedGarment = await res.json();
          extracted = data;
          setResults((prev) => ({ ...prev, [photo.previewUrl]: { status: "saving", data } }));
          // Independent of whether saving to *your* closet succeeds — it only reads other
          // owners' closets, so fire it as soon as we have tags rather than waiting on save.
          checkCrossUserMatch(photo.previewUrl, data);

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
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [photo.previewUrl]: {
              status: "error",
              message: err instanceof Error ? err.message : "Extraction failed",
              data: extracted,
            },
          }));
        }
      })
    );

    setIsExtracting(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-white">
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-pink-400">
          Step 1: Catalog Vault
        </span>
        <h1 className="font-display mt-2 text-5xl text-white sm:text-6xl">
          Upload Your Closet
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-300">
          Upload photos of your garments. Slaydar Vision AI will tag category, color, material, and brand.
        </p>
      </div>

      {/* Dotted Neon Dropzone */}
      <label className="mt-8 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-pink-500/40 bg-pink-500/5 p-8 text-center transition-all hover:border-[#ccff00] hover:bg-pink-500/10 focus-within:ring-2 focus-within:ring-[#ccff00]">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0b14]">
            <Camera className="h-6 w-6 text-[#ccff00]" strokeWidth={2.25} aria-hidden="true" />
          </div>
        </div>
        <span className="mt-4 text-base font-extrabold text-white">
          Click to choose outfit photos
        </span>
        <span className="mt-1 text-xs font-semibold text-slate-400">
          or drag and drop JPEG/PNG images
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </label>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Selected Photos ({photos.length})
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo, index) => {
              const result = results[photo.previewUrl];
              const extractedData =
                result?.status === "saved" || result?.status === "error" ? result.data : undefined;
              return (
                <div
                  key={photo.previewUrl}
                  className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl p-3 border border-white/10"
                >
                  <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-black">
                    {isHeicFile(photo.file) ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-pink-500/10 p-2 text-center">
                        <ImageOff className="h-7 w-7 text-pink-200" strokeWidth={2} aria-hidden="true" />
                        <span className="line-clamp-2 text-[10px] break-all font-semibold text-pink-200">
                          {photo.file.name}
                        </span>
                        <span className="text-[9px] text-slate-400">no preview, still works</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.previewUrl}
                        alt={photo.file.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 min-h-[32px] min-w-[32px] flex cursor-pointer items-center justify-center rounded-full bg-black/80 text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      aria-label={`Remove ${photo.file.name}`}
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>

                  {result?.status === "pending" && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-pink-400 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-pink-400 animate-ping" />
                      Vision Tagging...
                    </div>
                  )}
                  {result?.status === "saving" && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-400 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Saving to vault...
                    </div>
                  )}
                  {result?.status === "error" && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      {result.message}
                    </p>
                  )}
                  {result?.status === "saved" && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-black text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      Extracted &amp; Saved
                    </p>
                  )}
                  {extractedData && (
                    <div className="mt-1">
                      <GarmentChips data={extractedData} />

                      {crossMatches[photo.previewUrl]?.status === "checking" && (
                        <p className="mt-2 text-[11px] text-slate-400 animate-pulse">Checking network...</p>
                      )}
                      {crossMatches[photo.previewUrl]?.status === "found" && (
                        <div className="mt-3 rounded-xl border border-pink-500/30 bg-pink-500/10 p-2.5 text-[11px]">
                          {(() => {
                            const cm = crossMatches[photo.previewUrl];
                            if (cm.status !== "found") return null;
                            return (
                              <>
                                <p className="flex items-center gap-1.5 font-extrabold text-pink-300">
                                  <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                  {cm.garment.owner_id} owns this too
                                </p>
                                <Link
                                  href={`/listing/${cm.garment.garment_id}`}
                                  className="mt-1 inline-flex items-center gap-1 font-bold text-pink-300 underline hover:text-white"
                                >
                                  View their listing
                                  <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                                </Link>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extract Trigger Action */}
      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={handleExtract}
          disabled={photos.length === 0 || isExtracting}
          className="min-h-[48px] rounded-full bg-[#ccff00] px-8 text-xs font-black uppercase tracking-wider text-[#0c0b14] shadow-lg shadow-[#ccff00]/20 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
        >
          {isExtracting
            ? "Extracting Vision Tags..."
            : `Extract ${photos.length || ""} Item${photos.length === 1 ? "" : "s"} →`}
        </button>
      </div>

      {/* Product Link Resolver Integration */}
      <LinkResolveForm />
    </main>
  );
}
