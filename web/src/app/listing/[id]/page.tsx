import { notFound } from "next/navigation";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import ListingActions from "@/components/ListingActions";

async function getGarment(id: string): Promise<Garment | null> {
  const apiBaseUrl = process.env.API_BASE_URL;
  if (apiBaseUrl) {
    try {
      const res = await fetch(`${apiBaseUrl}/garments/${id}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {
      // fall through to mock lookup below
    }
  }
  return mockGarments.find((g) => g.garment_id === id) ?? null;
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const garment = await getGarment(id);
  if (!garment) notFound();

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold capitalize">
        {garment.color} {garment.category}
        {garment.brand ? `, ${garment.brand}` : ""}
      </h1>

      <div className="mt-6 rounded-lg border border-gray-200 p-6 text-center dark:border-white/10">
        <p className="text-xs tracking-wide text-gray-400 uppercase">Condition score</p>
        <p className="mt-1 text-5xl font-bold">{garment.condition_score}</p>
        <p className="mt-2 text-xs text-gray-500">
          Verified from tracked wear history, not a one-time snapshot.
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-gray-400">Wear count</dt>
          <dd className="font-medium">{garment.wear_count}</dd>
        </div>
        <div>
          <dt className="text-gray-400">Last worn</dt>
          <dd className="font-medium">{garment.last_worn_date ?? "never"}</dd>
        </div>
        <div>
          <dt className="text-gray-400">Cost per wear</dt>
          <dd className="font-medium">
            {garment.cost_per_wear != null ? `$${garment.cost_per_wear.toFixed(2)}` : "unknown"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-400">Material</dt>
          <dd className="font-medium">{garment.material}</dd>
        </div>
      </dl>

      <ListingActions garmentId={garment.garment_id} />
    </main>
  );
}
