import Link from "next/link";

function RadarMark() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      className="text-black dark:text-white"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="26" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <circle cx="28" cy="28" r="18" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <circle cx="28" cy="28" r="10" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="41" cy="17" r="3" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center p-8 text-center">
      <RadarMark />
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Slaydar</h1>
      <p className="mt-2 text-sm tracking-wide text-gray-500 uppercase">
        it&apos;s scanning. it sees everything.
      </p>

      <p className="mt-6 text-base text-gray-600 dark:text-gray-300">
        Catalog your closet from photos, get roasted (affectionately) about how you actually wear
        your clothes, and turn your tracked wear history into a verified trust signal when you
        resell — backed by real usage data, not a one-time snapshot.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/upload"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Upload your closet
        </Link>
        <Link
          href="/closet"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium dark:border-white/20"
        >
          View closet
        </Link>
      </div>

      <p className="mt-10 text-xs text-gray-400">
        Every garment is tracked as real, verifiable data — built on DataHub.
      </p>
    </main>
  );
}
