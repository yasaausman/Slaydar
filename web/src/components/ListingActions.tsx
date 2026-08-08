"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
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
    <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
      {/* Resale Ownership Transfer Button */}
      {transfer.step !== "done" && (
        <button
          type="button"
          onClick={handleTransfer}
          disabled={transfer.step === "transferring"}
          className="min-h-[48px] w-full rounded-full bg-[#ccff00] px-6 text-xs font-black uppercase tracking-wider text-[#0c0b14] shadow-lg shadow-[#ccff00]/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
        >
          {transfer.step === "transferring"
            ? "Transferring Ownership on DataHub..."
            : "List & Transfer Ownership to Demo Buyer →"}
        </button>
      )}

      {transfer.step === "error" && (
        <p className="flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs font-bold text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          {transfer.message}
        </p>
      )}

      {transfer.step === "done" && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-5 text-xs text-slate-200">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            Successfully Listed &amp; Transferred!
          </p>
          <p className="mt-2 leading-relaxed">
            The new owner on DataHub is <strong className="text-white">{transfer.newGarment.owner_id}</strong>.
            All verified wear history and condition metrics carry forward into the buyer&apos;s vault.
          </p>
          <div className="mt-3">
            <Link
              href={`/listing/${transfer.newGarment.garment_id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-4 py-1.5 text-xs font-extrabold text-emerald-300 underline hover:text-white"
            >
              View Buyer&apos;s Resale Vault Entry ({transfer.newGarment.garment_id})
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {/* DataHub Lineage Chain Explorer */}
      <div>
        <button
          type="button"
          onClick={handleViewLineage}
          disabled={lineage.step === "loading"}
          className="min-h-[44px] w-full rounded-full glass-card border border-white/15 px-6 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          {lineage.step === "loading"
            ? "Fetching Provenance Chain..."
            : "View DataHub Ownership History Lineage"}
        </button>

        {lineage.step === "error" && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            {lineage.message}
          </p>
        )}

        {lineage.step === "done" && (
          <div className="mt-4 glass-panel rounded-2xl p-4 border border-pink-500/30">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400">
              Verifiable Ownership Lineage
            </span>
            <ol className="mt-3 space-y-2 text-xs">
              {lineage.chain.map((node, i) => (
                <li
                  key={node.urn}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/10"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-black text-pink-300">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white">
                      Owner: <span className="text-[#ccff00]">{node.owner_id}</span>
                    </p>
                    <code className="text-[10px] text-slate-400 truncate block max-w-xs font-mono">
                      ID: {node.garment_id}
                    </code>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
