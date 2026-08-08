interface SlaydarAgentCardProps {
  statTag: string;
  roastText: string;
  className?: string;
}

export default function SlaydarAgentCard({ statTag, roastText, className = "" }: SlaydarAgentCardProps) {
  return (
    <div
      className={`glass-panel relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10 ${className}`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-lime-400/15 blur-3xl" />

      {/* Header identity */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-lime-300 p-[2px] shadow-lg shadow-fuchsia-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#12091f]">
              <span className="text-xl" role="img" aria-label="Fashion Agent Icon">
                💅
              </span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black">
              <span className="h-2 w-2 rounded-full bg-[#d9ff3b] animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide text-white">Slaydar Agent</h3>
              <span className="rounded-full bg-[#d9ff3b]/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#d9ff3b] border border-[#d9ff3b]/30">
                Style Judge
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">Personal Wardrobe AI</p>
          </div>
        </div>

        {/* Real stat pill badge */}
        <span className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 px-3 py-1 text-xs font-black text-fuchsia-300 shadow-sm">
          {statTag}
        </span>
      </div>

      {/* Speech bubble roast content */}
      <div className="mt-4 flex items-start gap-3">
        <div className="relative flex-1 rounded-2xl bg-[#1b0d2d]/90 border border-fuchsia-500/20 p-4 text-sm font-medium leading-relaxed text-slate-100 shadow-inner">
          <p className="relative z-10 font-sans text-sm font-semibold tracking-wide text-slate-100 sm:text-base">
            &ldquo;{roastText}&rdquo;
          </p>
          <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-400/80">
            Stat-Verified Style Judgment
          </div>
        </div>
      </div>
    </div>
  );
}
