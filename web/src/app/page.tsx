import Link from "next/link";
import { Camera, Flame, BarChart3, BadgeDollarSign, ArrowRight, ShieldCheck } from "lucide-react";
import SlaydarAgentCard from "@/components/SlaydarAgentCard";

const FEATURES = [
  {
    Icon: Camera,
    title: "Catalog from photos",
    body: "Upload closet photos or paste product links. Slaydar tags category, color, material, and brand automatically.",
    accent: "text-indigo-300",
    ring: "group-hover:border-indigo-500/40",
  },
  {
    Icon: Flame,
    title: "Stat-backed roasts",
    body: "Check in daily. Slaydar's AI roasts your wear habits using exact stats — never your body, always your wardrobe.",
    accent: "text-[#38bdf8]",
    ring: "group-hover:border-[#38bdf8]/40",
  },
  {
    Icon: BarChart3,
    title: "Track wear history",
    body: "Monitor wear counts, cost-per-wear, and staleness. Overworn and forgotten pieces get flagged automatically.",
    accent: "text-blue-300",
    ring: "group-hover:border-blue-500/40",
  },
  {
    Icon: BadgeDollarSign,
    title: "Resell with proof",
    body: "List items with a verified Condition Score computed from real wear logs, carrying DataHub lineage to buyers.",
    accent: "text-cyan-300",
    ring: "group-hover:border-cyan-500/40",
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
            className="glass-panel animate-rise-in relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 sm:p-10 lg:col-span-2 lg:row-span-2"
            style={{ animationDelay: "0ms" }}
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-[#38bdf8] animate-ping" />
                Slaydar Wardrobe Agent
              </div>

              <h1 className="font-display mt-6 text-[3.25rem] leading-[0.9] text-white sm:text-7xl">
                We know your wardrobe better than{" "}
                <span className="text-[#38bdf8] text-glow-primary">you do you</span> 😮‍💨
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
                  className="group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#38bdf8] px-8 text-sm font-black uppercase tracking-wider text-[#070c1a] shadow-lg shadow-[#38bdf8]/20 transition-all hover:bg-sky-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  Upload your closet
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                </Link>
                <Link
                  href="/closet"
                  className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full glass-card px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              How Slaydar works
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Wear-history intelligence</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card glass-card-hover animate-rise-in group flex flex-col rounded-2xl border border-white/10 p-6 ${f.ring}`}
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform group-hover:-translate-y-0.5">
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
