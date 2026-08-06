import type { ExtractedGarment } from "@/lib/types";

export default function GarmentChips({ data }: { data: ExtractedGarment }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-700 capitalize dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
        {data.category}
      </span>
      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700 capitalize dark:bg-purple-500/15 dark:text-purple-300">
        {data.color}
      </span>
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 capitalize dark:bg-indigo-500/15 dark:text-indigo-300">
        {data.material}
      </span>
      {data.brand && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          {data.brand}
        </span>
      )}
    </div>
  );
}
