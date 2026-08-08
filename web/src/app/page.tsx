import Link from "next/link";
import { Camera, Flame, BarChart3, BadgeDollarSign, ArrowRight, ShieldCheck } from "lucide-react";
import SlaydarAgentCard from "@/components/SlaydarAgentCard";

const FEATURES = [
  {
    Icon: Camera,
    title: "Catalog from photos",
    body: "Upload closet photos or paste product links. Slaydar tags category, color, material, and brand automatically.",
    accent: "text-pink-300",
    ring: "group-hover:border-pink-500/40",
    sticker: "Cyber Cute!",
    stickerClass: "y2k-sticker",
  },
  {
    Icon: Flame,
    title: "Stat-backed roasts",
    body: "Check in daily. Slaydar's AI roasts your wear habits using exact stats — never your body, always your wardrobe.",
    accent: "text-[#ccff00]",
    ring: "group-hover:border-[#ccff00]/40",
    sticker: "Slayyy",
    stickerClass: "y2k-sticker-lime y2k-sticker",
  },
  {
    Icon: BarChart3,
    title: "Track wear history",
    body: "Monitor wear counts, cost-per-wear, and staleness. Overworn and forgotten pieces get flagged automatically.",
    accent: "text-purple-300",
    ring: "group-hover:border-purple-500/40",
    sticker: null,
    stickerClass: "",
  },
  {
    Icon: BadgeDollarSign,
    title: "Resell with proof",
    body: "List items with a verified Condition Score computed from real wear logs, carrying DataHub lineage to buyers.",
    accent: "text-cyan-300",
    ring: "group-hover:border-cyan-500/40",
    sticker: "Y2K Approved",
    stickerClass: "y2k-sticker",
  },
];

export default function Home() {
  return (
    <main className="flex-1 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {/* ── Hero bento ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:auto-rows-[minmax(0,1fr)]">
          {/* Headline block — spans 2 cols / 2 rows */}
          <div
            className="glass-panel holo-sheen animate-rise-in relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 sm:p-10 lg:col-span-2 lg:row-span-2"
            style={{ animationDelay: "0ms" }}
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#ccff00]/12 blur-3xl" />

            {/* Y2K sticker flair */}
            <span className="y2k-sticker absolute right-6 top-6 z-10 rotate-6 text-[10px]">
              <span aria-hidden="true">💿</span> Y2K Approved
            </span>

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-pink-300">
                  <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-ping" />
                  Slaydar Cyber Judgment
                </span>
                <span className="y2k-sticker-lime y2k-sticker -rotate-3 text-[10px]">
                  <span aria-hidden="true">👾</span> Slayyy
                </span>
              </div>

              <h1 className="font-display mt-6 text-[3.25rem] leading-[0.9] text-white sm:text-7xl">
                We know your wardrobe better than{" "}
                <span className="text-[#ccff00] text-glow-primary">you do you</span>{" "}
                <span aria-hidden="true">✨</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
                Catalog your closet from photos, get roasted by your personal AI fashion judge for
                how you actually wear your clothes, and turn wear history into a verified trust
                signal when you resell.
              </p>
            </div>

            <div className="relative mt-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/upload"
                  className="group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ccff00] px-8 text-sm font-black uppercase tracking-wider text-[#0c0b14] shadow-lg shadow-[#ccff00]/20 transition-all hover:bg-lime-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
                >
                  Upload your closet
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                </Link>
                <Link
                  href="/closet"
                  className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full glass-card px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  View closet
                </Link>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
                Verifiable wear data backed by DataHub lineage
              </div>
            </div>
          </div>

          {/* Live roast card — right column, stacked, stretched to align with headline */}
          <div className="animate-rise-in h-full" style={{ animationDelay: "80ms" }}>
            <SlaydarAgentCard
              className="h-full"
              statTag="worn 4x this week"
              roastText="Fourth time this week, bestie. This shirt is unionizing."
            />
          </div>
          <div className="animate-rise-in h-full" style={{ animationDelay: "160ms" }}>
            <SlaydarAgentCard
              className="h-full"
              statTag="14 owned, 3 worn"
              roastText="You own 14 black t-shirts and wore 3 of them. List the other 11."
            />
          </div>
        </div>

        {/* ── Feature tiles ───────────────────────────────────────────── */}
        <div className="mt-12">
          <div className="rule-hard mb-6 flex items-center justify-between pt-4">
            <span className="text-xs font-black uppercase tracking-widest text-pink-400">
              How Slaydar works
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Wear-history intelligence</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card glass-card-hover animate-rise-in group relative flex flex-col rounded-2xl p-6 ${f.ring}`}
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                {f.sticker && (
                  <span className={`${f.stickerClass} absolute -right-2 -top-3 rotate-6 text-[9px]`}>
                    {f.sticker}
                  </span>
                )}
                <div className="y2k-chrome-border flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:-translate-y-0.5">
                  <f.Icon className={`h-6 w-6 ${f.accent}`} strokeWidth={2.25} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-extrabold text-white">{f.title}</h2>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
