import Link from "next/link";
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
      {/* Pinterest Board Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Pinterest Board Icon">
              📌
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-[#d9ff3b]">
              ishani&apos;s Wardrobe Board
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border ${
                live
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-purple-500/15 text-purple-300 border-purple-500/30"
              }`}
            >
              {live ? "Live DataHub API" : "Mock Board Preview"}
            </span>
          </div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Pinterest Closet Board
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-300">
            Aesthetic wardrobe catalog pins with real wear metrics and resale trust scores.
          </p>
        </div>

        <Link
          href="/upload"
          className="mt-4 sm:mt-0 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#d9ff3b] px-6 text-xs font-black uppercase tracking-wider text-[#0d0714] shadow-lg shadow-[#d9ff3b]/20 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#d9ff3b]"
        >
          <span>+ Pin new garment</span>
        </Link>
      </div>

      {/* Summary KPI Board Bar */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Total Pins
          </span>
          <p className="mt-1 text-2xl font-black text-white">{garments.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">
            🔥 Overworn
          </span>
          <p className="mt-1 text-2xl font-black text-rose-300">{overwornCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
            💤 Forgotten
          </span>
          <p className="mt-1 text-2xl font-black text-amber-300">{unwornCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-cyan-500/20 bg-cyan-500/5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
            🏷️ Resale Ready
          </span>
          <p className="mt-1 text-2xl font-black text-cyan-300">{resaleCount}</p>
        </div>
      </div>

      {/* Interactive Pinterest Masonry Grid */}
      <PinterestClosetGrid garments={garments} />
    </main>
  );
}
