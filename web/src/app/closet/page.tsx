import { mockGarments, type Garment } from "@/lib/mock-garments";
import { DEMO_OWNER_ID } from "@/lib/constants";

async function getCloset(): Promise<{ garments: Garment[]; live: boolean }> {
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) return { garments: mockGarments, live: false };

  try {
    const res = await fetch(`${apiBaseUrl}/closet/${DEMO_OWNER_ID}`, { cache: "no-store" });
    if (!res.ok) return { garments: mockGarments, live: false };
    const garments: Garment[] = await res.json();
    return { garments, live: true };
  } catch {
    return { garments: mockGarments, live: false };
  }
}

const statusStyles: Record<Garment["status"], string> = {
  active: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  "flagged-overworn": "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  "flagged-unworn": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "listed-for-resale": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

export default async function ClosetPage() {
  const { garments, live } = await getCloset();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">Closet</h1>
      <p className="mt-1 text-sm text-gray-500">
        {live ? "Live from DataHub via /api." : "Backend unreachable — showing mock data."}
      </p>

      {garments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">No garments yet — upload some photos first.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {garments.map((garment) => (
            <div key={garment.garment_id} className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium capitalize">{garment.category}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[garment.status]}`}>
                  {garment.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {garment.color} · {garment.material}
                {garment.brand ? ` · ${garment.brand}` : ""}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Worn {garment.wear_count}x
                {garment.last_worn_date ? ` · last ${garment.last_worn_date}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
