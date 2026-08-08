import Link from "next/link";
import SlaydarAgentCard from "@/components/SlaydarAgentCard";

function SlaydarBadge() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-fuchsia-600/30 blur-2xl" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-lime-300 p-[3px] shadow-[0_0_30px_rgba(217,255,59,0.3)]">
        <div className="flex h-full w-full items-center justify-center rounded-[21px] bg-[#0d0714]">
          <span className="text-4xl" role="img" aria-label="Fashion AI Icon">
            👑
          </span>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    emoji: "📸",
    title: "Catalog from photos",
    body: "Upload closet photos or paste product links. Slaydar tags category, color, material, and brand automatically.",
  },
  {
    emoji: "🔥",
    title: "Stat-backed roasts",
    body: "Check in daily. Slaydar's AI roasts your wear habits using exact stats — never your body, always your wardrobe.",
  },
  {
    emoji: "📊",
    title: "Track wear history",
    body: "Monitor wear counts, cost-per-wear, and staleness. Overworn and forgotten pieces get flagged automatically.",
  },
  {
    emoji: "💰",
    title: "Resell with proof",
    body: "List items with a verified Condition Score computed from real wear logs, carrying DataHub lineage to buyers.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
        {/* Slaydar Agent Mascot Icon */}
        <SlaydarBadge />

        <div className="mt-6 flex items-center gap-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-4 py-1 text-xs font-black uppercase tracking-widest text-fuchsia-300 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#d9ff3b] animate-ping" />
          Slaydar Wardrobe Agent
        </div>

        <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl drop-shadow-md">
          We know your wardrobe better than <span className="text-[#d9ff3b] text-glow-lime">you do you</span> 😮‍💨
        </h1>

        <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
          Catalog your closet from photos, get roasted by your personal AI fashion judge for how you actually wear your clothes, and turn wear history into a verified trust signal when you resell.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/upload"
            className="min-h-[48px] flex items-center justify-center rounded-full bg-[#d9ff3b] px-8 text-sm font-black text-[#0d0714] shadow-lg shadow-[#d9ff3b]/20 transition-all hover:bg-lime-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#d9ff3b]"
          >
            Upload your closet →
          </Link>
          <Link
            href="/closet"
            className="min-h-[48px] flex items-center justify-center rounded-full glass-card px-8 text-sm font-black text-white transition-all hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          >
            View closet
          </Link>
        </div>

        {/* Slaydar AI Judgment Showcase Section */}
        <div className="mt-14 w-full max-w-xl text-left">
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-fuchsia-400">
              Live Agent Roasts
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Locked Persona Prompt Spec
            </span>
          </div>

          <div className="space-y-4">
            <SlaydarAgentCard
              statTag="worn 4x this week"
              roastText="Fourth time this week, bestie. This shirt is unionizing."
            />
            <SlaydarAgentCard
              statTag="14 owned, 3 worn"
              roastText="You own 14 black t-shirts and wore 3 of them. List the other 11."
            />
          </div>
        </div>

        {/* Features 4-Card Grid */}
        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <span className="text-3xl" role="img" aria-label={f.title}>
                  {f.emoji}
                </span>
                <h2 className="mt-3 text-base font-extrabold text-white">{f.title}</h2>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-300">{f.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Provenance footer notice */}
        <div className="mt-14 flex items-center gap-2 rounded-full glass-card px-4 py-2 text-xs font-semibold text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Verifiable wardrobe wear data backed by DataHub lineage
        </div>
      </div>
    </main>
  );
}
