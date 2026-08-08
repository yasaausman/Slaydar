import Link from "next/link";

const LINKS = [
  { href: "/upload", label: "Upload" },
  { href: "/closet", label: "Closet" },
  { href: "/checkin", label: "Check in" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d0714]/80 border-b border-white/10 shadow-2xl shadow-black/50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-lime-400 rounded-lg p-1">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-lime-300 p-[2px] transition group-hover:scale-105 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d0714]">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#d9ff3b] shadow-[0_0_10px_#d9ff3b] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white group-hover:text-[#d9ff3b] transition">
              Slaydar
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-400">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-ping" />
            AI Wardrobe Agent
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full px-4 text-xs font-extrabold tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-[#d9ff3b] focus:outline-none focus:ring-2 focus:ring-[#d9ff3b]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
