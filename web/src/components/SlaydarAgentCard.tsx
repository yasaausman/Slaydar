interface SlaydarAgentCardProps {
  statTag: string;
  roastText: string;
  className?: string;
}

export default function SlaydarAgentCard({ statTag, roastText, className = "" }: SlaydarAgentCardProps) {
  return (
    <div
      className={`glass-panel holo-sheen relative flex flex-col overflow-hidden rounded-3xl p-6 shadow-2xl ${className}`}
    >
      {/* Ambient Y2K glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-pink-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#ccff00]/15 blur-3xl" />

      {/* Header identity */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-[#c0c0c0]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="y2k-chrome-border relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-pink-500/20">
            <span className="text-xl" role="img" aria-label="Fashion Agent Icon">
              💅
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black">
              <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide text-white">Slaydar Agent</h3>
              <span className="rounded-full border border-[#ccff00]/40 bg-[#ccff00]/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#ccff00]">
                Style Judge
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#e6e6fa]/70">Personal Wardrobe AI</p>
          </div>
        </div>

        {/* Holographic stat pill */}
        <span className="shrink-0 rounded-full border-2 border-white/70 bg-gradient-to-r from-[#e6e6fa] via-white to-[#ff69b4] px-3 py-1 text-xs font-black text-[#17131f] shadow-[0_2px_0_rgba(0,0,0,0.3)]">
          {statTag}
        </span>
      </div>

      {/* Acid Lime speech bubble */}
      <div className="relative z-10 mt-4 flex flex-1 items-stretch gap-3">
        <div className="relative flex flex-1 flex-col justify-center rounded-2xl border-2 border-white/60 bg-gradient-to-br from-[#ccff00] to-[#b6e600] p-4 shadow-[0_4px_0_rgba(0,0,0,0.25),0_0_24px_rgba(204,255,0,0.35)]">
          <p className="relative z-10 font-sans text-sm font-black tracking-wide text-[#17131f] sm:text-base">
            &ldquo;{roastText}&rdquo;
          </p>
          <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#17131f]/70">
            Stat-Verified Style Judgment
          </div>
        </div>
      </div>
    </div>
  );
}
