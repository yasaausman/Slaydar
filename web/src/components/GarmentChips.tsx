import type { ExtractedGarment } from "@/lib/types";

export default function GarmentChips({ data }: { data: ExtractedGarment }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
        {data.category}
      </span>
      <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-300">
        {data.color}
      </span>
      <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
        {data.material}
      </span>
      {data.brand && (
        <span className="rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#38bdf8]">
          {data.brand}
        </span>
      )}
    </div>
  );
}
