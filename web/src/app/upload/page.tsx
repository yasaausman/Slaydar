"use client";

import { useState } from "react";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

type ExtractedGarment = {
  category: string;
  color: string;
  material: string;
  brand: string | null;
  style_tags: string[];
};

type ExtractionResult =
  | { status: "pending" }
  | { status: "done"; data: ExtractedGarment }
  | { status: "error"; message: string };

export default function UploadPage() {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<Record<string, ExtractionResult>>({});

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
          setResults((prev) => ({ ...prev, [photo.previewUrl]: { status: "done", data } }));
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
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Upload your closet</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add a few photos of your clothes — Slaydar will tag each one.
      </p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400">
        <span className="text-sm font-medium">Click to choose photos</span>
        <span className="mt-1 text-xs text-gray-400">or drag and drop</span>
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
              <div key={photo.previewUrl}>
                <div className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={photo.file.name}
                    className="h-full w-full rounded-md object-cover"
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
                  <p className="mt-2 text-xs text-gray-400">Tagging…</p>
                )}
                {result?.status === "error" && (
                  <p className="mt-2 text-xs text-red-500">{result.message}</p>
                )}
                {result?.status === "done" && (
                  <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-white/10">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
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
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isExtracting ? "Extracting…" : `Extract ${photos.length || ""} item${photos.length === 1 ? "" : "s"}`}
      </button>
    </main>
  );
}
