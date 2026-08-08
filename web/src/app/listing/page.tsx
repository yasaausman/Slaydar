import Link from "next/link";

export default function ListingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-white">
      <div className="glass-panel flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-white/10 shadow-2xl">
        <span className="text-4xl" role="img" aria-label="Resale Tag">
          🏷️
        </span>
        <span className="mt-4 text-xs font-black uppercase tracking-widest text-[#d9ff3b]">
          Verified Resale Vault
        </span>
        <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
          Resale Listing Index
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-300 max-w-md">
          Pick an overworn or forgotten item from your closet to generate its verified condition score and list it for resale.
        </p>

        <Link
          href="/closet"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-8 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-105"
        >
          Go to Closet Vault →
        </Link>
      </div>
    </main>
  );
}
