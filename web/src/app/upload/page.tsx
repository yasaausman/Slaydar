"use client";

import { useState } from "react";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

export default function UploadPage() {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

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
    // TODO (Step 4): send each photo to /api/extract for vision tagging.
    await new Promise((resolve) => setTimeout(resolve, 500));
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
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.previewUrl} className="group relative aspect-square">
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
          ))}
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
