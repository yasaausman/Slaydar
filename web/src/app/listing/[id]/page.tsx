import { notFound } from "next/navigation";
import { ShieldCheck, Repeat, CalendarDays, DollarSign, Shirt } from "lucide-react";
import { mockGarments, type Garment } from "@/lib/mock-garments";
import ListingActions from "@/components/ListingActions";
import { fetchGarment } from "@/lib/backend";
import ConditionRing from "@/components/ConditionRing";

async function getGarment(id: string): Promise<Garment | null> {
  const live = await fetchGarment(id);
  return live ?? mockGarments.find((g) => g.garment_id === id) ?? null;
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const garment = await getGarment(id);
  if (!garment) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Page Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#38bdf8]">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Verified Resale Listing
          </span>
          <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
            {garment.status}
          </span>
        </div>
        <h1 className="font-display mt-2 text-5xl capitalize text-white sm:text-6xl">
          {garment.color} {garment.category}
          {garment.brand ? `, ${garment.brand}` : ""}
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-300">
          Owner: <code className="text-[#38bdf8] font-bold">{garment.owner_id}</code> · ID: <code className="text-slate-400">{garment.garment_id}</code>
        </p>
      </div>

      {/* Hero Condition Ring Card */}
      <div className="mt-8 glass-panel relative overflow-hidden rounded-3xl p-8 text-center border border-white/10 shadow-2xl">
        <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Verified Condition Score
        </span>

        <div className="mt-5 flex justify-center">
          <ConditionRing score={garment.condition_score} size={150} strokeWidth={12} />
        </div>

        <p className="mt-5 text-xs font-semibold text-slate-300 max-w-sm mx-auto">
          Calculated from real, tamper-proof wear logs tracked on DataHub — not an unverified photo snapshot.
        </p>
      </div>

      {/* Tracked Wear Metrics Grid */}
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <Repeat className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Total Wears
          </dt>
          <dd className="stat-number mt-1.5 text-3xl text-white">{garment.wear_count}x</dd>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Last Worn Date
          </dt>
          <dd className="mt-1.5 text-sm font-extrabold text-slate-200 truncate">
            {garment.last_worn_date ?? "Never"}
          </dd>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <DollarSign className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Cost Per Wear
          </dt>
          <dd className="stat-number mt-1.5 text-3xl text-[#38bdf8]">
            {garment.cost_per_wear != null ? `$${garment.cost_per_wear.toFixed(2)}` : "—"}
          </dd>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <Shirt className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Material
          </dt>
          <dd className="mt-1.5 text-sm font-extrabold capitalize text-indigo-300 truncate">
            {garment.material}
          </dd>
        </div>
      </dl>

      {/* Listing Actions & Lineage */}
      <ListingActions garmentId={garment.garment_id} />
    </main>
  );
}
