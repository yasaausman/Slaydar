"use client";

import { useState } from "react";
import Link from "next/link";
import type { Garment } from "@/lib/mock-garments";

interface PinterestClosetGridProps {
  garments: Garment[];
}

type FilterKey = "all" | "active" | "flagged-overworn" | "flagged-unworn" | "listed-for-resale";

const statusBadges: Record<Garment["status"], { bg: string; text: string; border: string; label: string; icon: string }> = {
  active: {
    bg: "bg-[#d9ff3b]/15 shadow-[0_0_12px_rgba(217,255,59,0.2)]",
    text: "text-[#d9ff3b]",
    border: "border-[#d9ff3b]/40",
    label: "Active Wear",
    icon: "✨",
  },
  "flagged-overworn": {
    bg: "bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    text: "text-rose-300",
    border: "border-rose-500/50",
    label: "Overworn",
    icon: "🔥",
  },
  "flagged-unworn": {
    bg: "bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    text: "text-amber-300",
    border: "border-amber-500/50",
    label: "Forgotten",
    icon: "💤",
  },
  "listed-for-resale": {
    bg: "bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    text: "text-cyan-300",
    border: "border-cyan-500/50",
    label: "Resale Listed",
    icon: "🏷️",
  },
};

export default function PinterestClosetGrid({ garments }: PinterestClosetGridProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredGarments = garments.filter((g) => {
    if (filter === "all") return true;
    return g.status === filter;
  });

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All Pins", count: garments.length },
    { key: "active", label: "✨ Active", count: garments.filter((g) => g.status === "active").length },
    { key: "flagged-overworn", label: "🔥 Overworn", count: garments.filter((g) => g.status === "flagged-overworn").length },
    { key: "flagged-unworn", label: "💤 Forgotten", count: garments.filter((g) => g.status === "flagged-unworn").length },
    { key: "listed-for-resale", label: "🏷️ Resale Ready", count: garments.filter((g) => g.status === "listed-for-resale").length },
  ];

  return (
    <div>
      {/* Pinterest Board Filter Pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`min-h-[44px] flex items-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-[#d9ff3b] ${
                isActive
                  ? "bg-[#d9ff3b] text-[#0d0714] shadow-lg shadow-[#d9ff3b]/20 scale-105"
                  : "glass-card text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-[#0d0714]/20 text-[#0d0714]" : "bg-white/10 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pinterest Masonry Card Grid */}
      {filteredGarments.length === 0 ? (
        <div className="mt-12 glass-panel flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-white/10">
          <span className="text-4xl" role="img" aria-label="Empty board">
            📌
          </span>
          <h3 className="mt-3 text-lg font-bold text-white">No pins in this board section</h3>
          <p className="mt-1 text-xs text-slate-400">Try selecting a different filter pill or upload new garments.</p>
        </div>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 space-y-4">
          {filteredGarments.map((garment) => {
            const badge = statusBadges[garment.status];

            return (
              <div
                key={garment.garment_id}
                className="glass-card glass-card-hover group relative break-inside-avoid flex flex-col overflow-hidden rounded-3xl p-5 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#d9ff3b]/40 hover:shadow-2xl hover:shadow-[#d9ff3b]/10"
              >
                {/* Floating Pinterest Pin Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-300">
                      Score: {garment.condition_score}%
                    </span>
                    <button
                      type="button"
                      aria-label={`Pin ${garment.color} ${garment.category}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white opacity-60 transition group-hover:opacity-100 hover:bg-fuchsia-500/30"
                    >
                      📌
                    </button>
                  </div>
                </div>

                {/* Garment Title & Metadata */}
                <div className="mt-4">
                  <h3 className="text-xl font-black capitalize tracking-tight text-white group-hover:text-[#d9ff3b] transition">
                    {garment.color} {garment.category}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-300">
                      {garment.material}
                    </span>
                    {garment.brand && (
                      <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                        {garment.brand}
                      </span>
                    )}
                  </div>
                </div>

                {/* Wear Metrics & Cost-per-wear */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Wear Count
                    </span>
                    <p className="mt-0.5 font-black text-white">{garment.wear_count}x worn</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Last Worn
                    </span>
                    <p className="mt-0.5 font-black text-slate-200 truncate">
                      {garment.last_worn_date ?? "Never"}
                    </p>
                  </div>
                </div>

                {garment.cost_per_wear != null && (
                  <div className="mt-2.5 text-xs font-semibold text-slate-400">
                    Cost per wear:{" "}
                    <strong className="text-[#d9ff3b] font-black">${garment.cost_per_wear.toFixed(2)}</strong>
                  </div>
                )}

                {/* Pinterest Pin Action Links */}
                {(garment.status === "flagged-overworn" || garment.status === "flagged-unworn") && (
                  <Link
                    href={`/listing/${garment.garment_id}`}
                    className="mt-5 flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-fuchsia-500/20 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  >
                    List for resale →
                  </Link>
                )}

                {garment.status === "listed-for-resale" && (
                  <Link
                    href={`/listing/${garment.garment_id}`}
                    className="mt-5 flex min-h-[44px] items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40 px-5 text-xs font-black uppercase tracking-wider text-cyan-300 transition-all hover:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    View resale listing →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
