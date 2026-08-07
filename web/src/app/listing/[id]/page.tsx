import { notFound } from "next/navigation";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import ListingActions from "@/components/ListingActions";
import { fetchGarment } from "@/lib/backend";

async function getGarment(id: string): Promise<Garment | null> {
  const live = await fetchGarment(id);
  return live ?? mockGarments.find((g) => g.garment_id === id) ?? null;
}

function scoreColor(score: number) {
  if (score >= 80) return { stroke: "#22c55e", text: "text-green-600" };
  if (score >= 50) return { stroke: "#f59e0b", text: "text-amber-600" };
  return { stroke: "#ef4444", text: "text-red-600" };
}

function ConditionRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const { stroke, text } = scoreColor(score);

  return (
    <div className="relative mx-auto h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-extrabold ${text}`}>{score}</span>
      </div>
    </div>
  );
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const garment = await getGarment(id);
  if (!garment) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
        Resale listing
      </p>
      <h1 className="mt-1 text-3xl font-extrabold capitalize sm:text-4xl">
        {garment.color} {garment.category}
        {garment.brand ? `, ${garment.brand}` : ""}
      </h1>

      <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-white/10">
        <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">Condition score</p>
        <div className="mt-4">
          <ConditionRing score={garment.condition_score} />
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Verified from tracked wear history, not a one-time snapshot.
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-white/70 p-3 dark:bg-white/5">
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">Wear count</dt>
          <dd className="mt-0.5 font-bold">{garment.wear_count}</dd>
        </div>
        <div className="rounded-xl bg-white/70 p-3 dark:bg-white/5">
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">Last worn</dt>
          <dd className="mt-0.5 font-bold">{garment.last_worn_date ?? "never"}</dd>
        </div>
        <div className="rounded-xl bg-white/70 p-3 dark:bg-white/5">
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost per wear</dt>
          <dd className="mt-0.5 font-bold">
            {garment.cost_per_wear != null ? `$${garment.cost_per_wear.toFixed(2)}` : "unknown"}
          </dd>
        </div>
        <div className="rounded-xl bg-white/70 p-3 dark:bg-white/5">
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">Material</dt>
          <dd className="mt-0.5 font-bold capitalize">{garment.material}</dd>
        </div>
      </dl>

      <ListingActions garmentId={garment.garment_id} />
    </main>
  );
}
