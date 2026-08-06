import Link from "next/link";

const LINKS = [
  { href: "/upload", label: "Upload" },
  { href: "/closet", label: "Closet" },
  { href: "/checkin", label: "Check in" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-700 shadow-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_8px_2px_rgba(217,255,59,0.7)]"
          />
          Slaydar
        </Link>
        <div className="flex gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/15 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
