"use client";

import { useState } from "react";
import Link from "next/link";
import type { Garment } from "@/lib/mock-garments";

type LineageNode = { garment_id: string; owner_id: string; urn: string };

type TransferState =
  | { step: "idle" }
  | { step: "transferring" }
  | { step: "done"; newGarment: Garment }
  | { step: "error"; message: string };

type LineageState =
  | { step: "idle" }
  | { step: "loading" }
  | { step: "done"; chain: LineageNode[] }
  | { step: "error"; message: string };

const DEMO_BUYER_ID = "buyer-demo";

export default function ListingActions({ garmentId }: { garmentId: string }) {
  const [transfer, setTransfer] = useState<TransferState>({ step: "idle" });
  const [lineage, setLineage] = useState<LineageState>({ step: "idle" });

  async function handleTransfer() {
    setTransfer({ step: "transferring" });
    try {
      const res = await fetch(`/api/garments/${garmentId}/transfer-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_owner_id: DEMO_BUYER_ID }),
      });
      if (!res.ok) throw new Error(`Transfer failed with ${res.status}`);
      const newGarment: Garment = await res.json();
      setTransfer({ step: "done", newGarment });
    } catch (err) {
      setTransfer({ step: "error", message: err instanceof Error ? err.message : "Transfer failed" });
    }
  }

  async function handleViewLineage() {
    setLineage({ step: "loading" });
    try {
      const res = await fetch(`/api/garments/${garmentId}/lineage`);
      if (!res.ok) throw new Error(`Lineage request failed with ${res.status}`);
      const data: { chain: LineageNode[] } = await res.json();
      setLineage({ step: "done", chain: data.chain });
    } catch (err) {
      setLineage({ step: "error", message: err instanceof Error ? err.message : "Lineage lookup failed" });
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {transfer.step !== "done" && (
        <button
          type="button"
          onClick={handleTransfer}
          disabled={transfer.step === "transferring"}
          className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {transfer.step === "transferring" ? "Listing…" : "List & transfer to demo buyer"}
        </button>
      )}
      {transfer.step === "error" && <p className="text-sm text-red-500">{transfer.message}</p>}
      {transfer.step === "done" && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          Listed and transferred. The new owner is <strong>{transfer.newGarment.owner_id}</strong>, and this
          item&apos;s history now carries forward as DataHub lineage. View it from the buyer&apos;s side:{" "}
          <Link href={`/listing/${transfer.newGarment.garment_id}`} className="font-semibold underline">
            {transfer.newGarment.garment_id}
          </Link>
          .
        </p>
      )}

      <div>
        <button
          type="button"
          onClick={handleViewLineage}
          disabled={lineage.step === "loading"}
          className="rounded-full border-2 border-purple-200 bg-white px-5 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          {lineage.step === "loading" ? "Loading…" : "View ownership history"}
        </button>
        {lineage.step === "error" && <p className="mt-2 text-sm text-red-500">{lineage.message}</p>}
        {lineage.step === "done" && (
          <ol className="mt-3 space-y-1.5 text-sm">
            {lineage.chain.map((node, i) => (
              <li
                key={node.urn}
                className="rounded-lg bg-white/70 px-3 py-1.5 text-gray-700 dark:bg-white/5 dark:text-gray-300"
              >
                {i + 1}. owner <strong>{node.owner_id}</strong> (<code className="text-xs">{node.garment_id}</code>)
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
