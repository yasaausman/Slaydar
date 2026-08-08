interface ConditionRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreTheme(score: number) {
  if (score >= 80) {
    return {
      stroke: "#ccff00",
      text: "text-[#ccff00]",
      glow: "shadow-[0_0_24px_rgba(204,255,0,0.4)]",
      badge: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30",
    };
  }
  if (score >= 50) {
    return {
      stroke: "#f59e0b",
      text: "text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  return {
    stroke: "#f43f5e",
    text: "text-rose-400",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
}

export default function ConditionRing({
  score,
  size = 140,
  strokeWidth = 10,
  label = "Condition Score",
}: ConditionRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const theme = getScoreTheme(score);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      aria-label={`${label}: ${score} out of 100`}
      role="img"
    >
      <div className={`relative rounded-full ${theme.glow} transition-all duration-500`} style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 transform"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(192, 192, 192, 0.28)"
            strokeWidth={strokeWidth}
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`stat-number text-5xl ${theme.text}`}>
            {score}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            / 100
          </span>
        </div>
      </div>
    </div>
  );
}
