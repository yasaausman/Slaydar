"use client";

import { useState } from "react";
import { DEMO_OWNER_ID } from "@/lib/constants";
import type { ExtractedGarment } from "@/lib/types";

type Stage =
  | { step: "idle" }
  | { step: "resolving" }
  | { step: "preview"; data: ExtractedGarment }
  | { step: "saving"; data: ExtractedGarment }
  | { step: "saved"; garmentId: string }
  | { step: "error"; message: string };

export default function LinkResolveForm() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>({ step: "idle" });

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setStage({ step: "resolving" });
    try {
      const res = await fetch("/api/resolve-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Request failed with ${res.status}`);
      setStage({ step: "preview", data: body });
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
    <div className="mt-10 border-t border-gray-200 pt-6 dark:border-white/10">
      <h2 className="text-sm font-semibold">Or paste a product link</h2>
      <p className="mt-1 text-xs text-gray-500">
        Skip the photo — resolve a retailer product page straight into a catalog entry.
      </p>

      <form onSubmit={handleResolve} className="mt-3 flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://retailer.example.com/product/..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={stage.step === "resolving" || !url}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {stage.step === "resolving" ? "Resolving…" : "Resolve"}
        </button>
      </form>

      {stage.step === "error" && <p className="mt-3 text-sm text-red-500">{stage.message}</p>}

      {(stage.step === "preview" || stage.step === "saving") && (
        <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-white/10">
          <p className="text-xs text-gray-400">Resolved to:</p>
          <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-white/10">
            {JSON.stringify(stage.data, null, 2)}
          </pre>
          <button
            type="button"
            onClick={() => handleSave(stage.data)}
            disabled={stage.step === "saving"}
            className="mt-3 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {stage.step === "saving" ? "Saving…" : "Save to closet"}
          </button>
        </div>
      )}

      {stage.step === "saved" && (
        <p className="mt-3 text-sm font-medium text-green-600">Saved to closet ({stage.garmentId})</p>
      )}
    </div>
  );
}
