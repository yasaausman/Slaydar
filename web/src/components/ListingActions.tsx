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
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {transfer.step === "transferring" ? "Listing…" : "List & transfer to demo buyer"}
        </button>
      )}
      {transfer.step === "error" && <p className="text-sm text-red-500">{transfer.message}</p>}
      {transfer.step === "done" && (
        <p className="text-sm text-green-600">
          Listed and transferred. The new owner is <strong>{transfer.newGarment.owner_id}</strong>, and this
          item&apos;s history now carries forward as DataHub lineage. View it from the buyer&apos;s side:{" "}
          <Link href={`/listing/${transfer.newGarment.garment_id}`} className="underline">
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
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-white/20"
        >
          {lineage.step === "loading" ? "Loading…" : "View ownership history"}
        </button>
        {lineage.step === "error" && <p className="mt-2 text-sm text-red-500">{lineage.message}</p>}
        {lineage.step === "done" && (
          <ol className="mt-3 space-y-1 text-sm">
            {lineage.chain.map((node, i) => (
              <li key={node.urn} className="text-gray-600 dark:text-gray-300">
                {i + 1}. owner <strong>{node.owner_id}</strong> (<code className="text-xs">{node.garment_id}</code>)
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
