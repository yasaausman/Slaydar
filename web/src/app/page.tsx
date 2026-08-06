import Link from "next/link";

function RadarMark() {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="relative" aria-hidden="true">
        <circle cx="48" cy="48" r="44" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
        <circle cx="48" cy="48" r="31" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="48" cy="48" r="18" stroke="white" strokeOpacity="0.6" strokeWidth="2" />
        <circle cx="70" cy="26" r="4" fill="#D9FF3B" />
      </svg>
      <div
        className="absolute inset-0 animate-spin [animation-duration:3s]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(217,255,59,0.5), transparent 25%, transparent 100%)",
          borderRadius: "9999px",
          maskImage: "radial-gradient(circle, transparent 0%, transparent 18%, black 19%, black 100%)",
        }}
      />
    </div>
  );
}

const FEATURES = [
  { emoji: "📸", title: "Snap your closet", body: "Upload a few photos and Slaydar tags the category, color, material, and brand for you." },
  { emoji: "🔥", title: "Get roasted (nicely)", body: "Check in daily. Every roast cites a real stat. Never your body, always your closet's choices." },
  { emoji: "📊", title: "Track real wear stats", body: "Wear count, cost per wear, staleness. Overworn and forgotten pieces flag themselves." },
  { emoji: "💰", title: "Resell with proof", body: "List with a condition score verified from tracked history, not a one-time snapshot." },
];

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <RadarMark />
        <h1 className="mt-6 text-6xl font-extrabold tracking-tight drop-shadow-sm">Slaydar</h1>
        <p className="mt-3 text-sm font-semibold tracking-[0.2em] text-lime-300 uppercase">
          We know you better than you do you 😮‍💨
        </p>

        <p className="mt-6 max-w-xl text-lg text-white/90">
          Catalog your closet from photos, get roasted (affectionately) for how you actually wear
          your clothes, and turn that wear history into a trust signal when you resell. All backed
          by real usage data, not a one-time snapshot.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-purple-950 shadow-lg shadow-black/20 transition hover:bg-lime-200"
          >
            Upload your closet
          </Link>
          <Link
            href="/closet"
            className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20"
          >
            View closet
          </Link>
        </div>

        {/* Live preview of the actual roast persona — locked examples from PLAN.md §5 */}
        <div className="mt-14 w-full max-w-md rounded-2xl bg-white p-5 text-left text-gray-900 shadow-2xl">
          <p className="text-xs font-semibold tracking-wide text-purple-500 uppercase">Slaydar says</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-fuchsia-100 px-2 py-1 text-xs font-bold text-fuchsia-700">
              worn 4x this week
            </span>
            <p className="text-sm">Fourth time this week, bestie. This shirt is unionizing.</p>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
              14 owned, 3 worn
            </span>
            <p className="text-sm">You own 14 black t-shirts and wore 3 of them. List the other 11.</p>
          </div>
        </div>

        <div className="mt-16 grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl bg-white/10 p-4 text-left backdrop-blur">
              <span className="text-2xl">{f.emoji}</span>
              <p className="mt-2 text-sm font-bold">{f.title}</p>
              <p className="mt-1 text-xs text-white/70">{f.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-xs text-white/60">
          Every garment is tracked as real, verifiable data, built on DataHub.
        </p>
      </div>
    </main>
  );
}
