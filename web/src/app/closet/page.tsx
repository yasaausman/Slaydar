import Link from "next/link";
import { LayoutGrid, Flame, Moon, Tag, Plus } from "lucide-react";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { fetchCloset } from "@/lib/backend";
import PinterestClosetGrid from "@/components/PinterestClosetGrid";

async function getCloset(): Promise<{ garments: Garment[]; live: boolean }> {
  const garments = await fetchCloset(DEMO_OWNER_ID);
  return garments ? { garments, live: true } : { garments: mockGarments, live: false };
}

export default async function ClosetPage() {
  const { garments, live } = await getCloset();

  const overwornCount = garments.filter((g) => g.status === "flagged-overworn").length;
  const unwornCount = garments.filter((g) => g.status === "flagged-unworn").length;
  const resaleCount = garments.filter((g) => g.status === "listed-for-resale").length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-white">
      {/* Board Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[#ccff00]" strokeWidth={2.5} aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-widest text-[#ccff00]">
              ishani&apos;s Wardrobe Board
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border ${
                live
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-purple-500/15 text-purple-300 border-purple-500/30"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-purple-400"}`} />
              {live ? "Live DataHub API" : "Mock Board Preview"}
            </span>
          </div>
          <h1 className="font-display mt-2 text-5xl text-white sm:text-6xl">
            The Closet Board
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Your wardrobe catalog with real wear metrics and resale trust scores.
          </p>
        </div>

        <Link
          href="/upload"
          className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ccff00] px-6 text-xs font-black uppercase tracking-wider text-[#0c0b14] shadow-lg shadow-[#ccff00]/20 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] sm:mt-0"
        >
          <Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          Pin new garment
        </Link>
      </div>

      {/* Summary KPI Board Bar — editorial stat tiles */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Total Pins
            </span>
            <p className="stat-number mt-1 text-4xl text-white">{garments.length}</p>
          </div>
          <LayoutGrid className="h-6 w-6 text-slate-500" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="glass-card flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">
              Overworn
            </span>
            <p className="stat-number mt-1 text-4xl text-rose-300">{overwornCount}</p>
          </div>
          <Flame className="h-6 w-6 text-rose-400" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="glass-card flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Forgotten
            </span>
            <p className="stat-number mt-1 text-4xl text-amber-300">{unwornCount}</p>
          </div>
          <Moon className="h-6 w-6 text-amber-400" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="glass-card flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
              Resale Ready
            </span>
            <p className="stat-number mt-1 text-4xl text-cyan-300">{resaleCount}</p>
          </div>
          <Tag className="h-6 w-6 text-cyan-400" strokeWidth={2} aria-hidden="true" />
        </div>
      </div>

      {/* Interactive Pinterest Masonry Grid */}
      <PinterestClosetGrid garments={garments} />
    </main>
  );
}
