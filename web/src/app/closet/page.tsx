import Link from "next/link";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { fetchCloset } from "@/lib/backend";

async function getCloset(): Promise<{ garments: Garment[]; live: boolean }> {
  const garments = await fetchCloset(DEMO_OWNER_ID);
  return garments ? { garments, live: true } : { garments: mockGarments, live: false };
}

const statusStyles: Record<Garment["status"], string> = {
  active: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  "flagged-overworn": "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  "flagged-unworn": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "listed-for-resale": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

const cardAccent: Record<Garment["status"], string> = {
  active: "border-t-gray-300 dark:border-t-white/20",
  "flagged-overworn": "border-t-red-400",
  "flagged-unworn": "border-t-amber-400",
  "listed-for-resale": "border-t-blue-400",
};

export default async function ClosetPage() {
  const { garments, live } = await getCloset();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
        Your wardrobe
      </p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Closet</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {live ? "Live from DataHub via /api." : "Backend's unreachable right now, so this is mock data."}
      </p>

      {garments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Nothing here yet. Upload some photos first.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {garments.map((garment) => (
            <div
              key={garment.garment_id}
              className={`rounded-xl border-t-4 bg-white/70 p-4 shadow-sm dark:bg-white/5 ${cardAccent[garment.status]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold capitalize">{garment.category}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[garment.status]}`}>
                  {garment.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {garment.color} · {garment.material}
                {garment.brand ? ` · ${garment.brand}` : ""}
              </p>
              <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Worn {garment.wear_count}x
                {garment.last_worn_date ? ` · last ${garment.last_worn_date}` : ""}
              </p>
              {(garment.status === "flagged-overworn" || garment.status === "flagged-unworn") && (
                <Link
                  href={`/listing/${garment.garment_id}`}
                  className="mt-3 block rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 py-1.5 text-center text-xs font-bold text-white shadow-sm"
                >
                  List for resale
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
