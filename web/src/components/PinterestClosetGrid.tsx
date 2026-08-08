"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Flame, Moon, Tag, Bookmark, LayoutGrid, ArrowRight, type LucideIcon } from "lucide-react";
import type { Garment } from "@/lib/mock-garments";

interface PinterestClosetGridProps {
  garments: Garment[];
}

type FilterKey = "all" | "active" | "flagged-overworn" | "flagged-unworn" | "listed-for-resale";

const statusBadges: Record<Garment["status"], { bg: string; text: string; border: string; label: string; Icon: LucideIcon }> = {
  active: {
    bg: "bg-[#38bdf8]/15 shadow-[0_0_12px_rgba(56, 189, 248,0.2)]",
    text: "text-[#38bdf8]",
    border: "border-[#38bdf8]/40",
    label: "Active Wear",
    Icon: Sparkles,
  },
  "flagged-overworn": {
    bg: "bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    text: "text-rose-300",
    border: "border-rose-500/50",
    label: "Overworn",
    Icon: Flame,
  },
  "flagged-unworn": {
    bg: "bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    text: "text-amber-300",
    border: "border-amber-500/50",
    label: "Forgotten",
    Icon: Moon,
  },
  "listed-for-resale": {
    bg: "bg-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    text: "text-cyan-300",
    border: "border-cyan-500/50",
    label: "Resale Listed",
    Icon: Tag,
  },
};

export default function PinterestClosetGrid({ garments }: PinterestClosetGridProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredGarments = garments.filter((g) => {
    if (filter === "all") return true;
    return g.status === filter;
  });

  const filterTabs: { key: FilterKey; label: string; count: number; Icon?: LucideIcon }[] = [
    { key: "all", label: "All Pins", count: garments.length, Icon: LayoutGrid },
    { key: "active", label: "Active", count: garments.filter((g) => g.status === "active").length, Icon: Sparkles },
    { key: "flagged-overworn", label: "Overworn", count: garments.filter((g) => g.status === "flagged-overworn").length, Icon: Flame },
    { key: "flagged-unworn", label: "Forgotten", count: garments.filter((g) => g.status === "flagged-unworn").length, Icon: Moon },
    { key: "listed-for-resale", label: "Resale Ready", count: garments.filter((g) => g.status === "listed-for-resale").length, Icon: Tag },
  ];

  return (
    <div>
      {/* Board Filter Pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`min-h-[44px] flex cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                isActive
                  ? "bg-[#38bdf8] text-[#070c1a] shadow-lg shadow-[#38bdf8]/20 scale-105"
                  : "glass-card text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {TabIcon && <TabIcon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-[#070c1a]/20 text-[#070c1a]" : "bg-white/10 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Masonry Card Grid */}
      {filteredGarments.length === 0 ? (
        <div className="mt-12 glass-panel flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-white/10">
          <LayoutGrid className="h-10 w-10 text-slate-500" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-white">No pins in this board section</h3>
          <p className="mt-1 text-xs text-slate-400">Try selecting a different filter pill or upload new garments.</p>
        </div>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 space-y-4">
          {filteredGarments.map((garment) => {
            const badge = statusBadges[garment.status];
            const BadgeIcon = badge.Icon;

            return (
              <div
                key={garment.garment_id}
                className="glass-card glass-card-hover group relative break-inside-avoid flex flex-col overflow-hidden rounded-3xl p-5 border border-white/10 shadow-xl transition-all duration-300 hover:border-[#38bdf8]/40 hover:shadow-2xl hover:shadow-[#38bdf8]/10"
              >
                {/* Pin Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    <BadgeIcon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-300">
                      Score: {garment.condition_score}%
                    </span>
                    <button
                      type="button"
                      aria-label={`Pin ${garment.color} ${garment.category}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-60 transition group-hover:opacity-100 hover:bg-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <Bookmark className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Garment Title & Metadata */}
                <div className="mt-4">
                  <h3 className="text-xl font-black capitalize tracking-tight text-white group-hover:text-[#38bdf8] transition">
                    {garment.color} {garment.category}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                      {garment.material}
                    </span>
                    {garment.brand && (
                      <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
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
                    <strong className="text-[#38bdf8] font-black">${garment.cost_per_wear.toFixed(2)}</strong>
                  </div>
                )}

                {/* Pin Action Links */}
                {(garment.status === "flagged-overworn" || garment.status === "flagged-unworn") && (
                  <Link
                    href={`/listing/${garment.garment_id}`}
                    className="mt-5 flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    List for resale
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                )}

                {garment.status === "listed-for-resale" && (
                  <Link
                    href={`/listing/${garment.garment_id}`}
                    className="mt-5 flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-5 text-xs font-black uppercase tracking-wider text-cyan-300 transition-all hover:bg-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    View resale listing
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
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
