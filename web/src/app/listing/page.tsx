import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";

export default function ListingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-white">
      <div className="glass-panel flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-white/10 shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Tag className="h-8 w-8 text-[#38bdf8]" strokeWidth={2} aria-hidden="true" />
        </div>
        <span className="mt-5 text-xs font-black uppercase tracking-widest text-[#38bdf8]">
          Verified Resale Vault
        </span>
        <h1 className="font-display mt-2 text-4xl text-white sm:text-5xl">
          Resale Listing Index
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-300 max-w-md">
          Pick an overworn or forgotten item from your closet to generate its verified condition score and list it for resale.
        </p>

        <Link
          href="/closet"
          className="mt-6 inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-8 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Go to Closet Board
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
