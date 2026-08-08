import type { ExtractedGarment } from "@/lib/types";

export default function GarmentChips({ data }: { data: ExtractedGarment }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      <span className="rounded-full bg-pink-500/15 border border-pink-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-pink-300">
        {data.category}
      </span>
      <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
        {data.color}
      </span>
      <span className="rounded-full bg-pink-500/15 border border-pink-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-pink-300">
        {data.material}
      </span>
      {data.brand && (
        <span className="rounded-full bg-[#ccff00]/15 border border-[#ccff00]/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#ccff00]">
          {data.brand}
        </span>
      )}
    </div>
  );
}
