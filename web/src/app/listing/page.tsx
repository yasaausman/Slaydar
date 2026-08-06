import Link from "next/link";

export default function ListingPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Listing</h1>
      <p className="mt-2 text-sm text-gray-500">
        Pick an overworn or unworn item from your{" "}
        <Link href="/closet" className="underline">
          closet
        </Link>{" "}
        to list it for resale.
      </p>
    </main>
  );
}
