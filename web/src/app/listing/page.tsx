import Link from "next/link";

export default function ListingPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <p className="text-xs font-bold tracking-[0.2em] text-fuchsia-600 uppercase dark:text-fuchsia-400">
        Resale
      </p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Listing</h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Pick an overworn or unworn item from your{" "}
        <Link href="/closet" className="font-semibold text-fuchsia-600 underline dark:text-fuchsia-400">
          closet
        </Link>{" "}
        to list it for resale.
      </p>
    </main>
  );
}
