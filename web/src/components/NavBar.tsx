import Link from "next/link";
import { Radar, Upload, Shirt, CalendarCheck } from "lucide-react";

const LINKS = [
  { href: "/upload", label: "Upload", Icon: Upload },
  { href: "/closet", label: "Closet", Icon: Shirt },
  { href: "/checkin", label: "Check in", Icon: CalendarCheck },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070c1a]/80 border-b border-white/10 shadow-2xl shadow-black/50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-3 group cursor-pointer rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-sky-300 p-[2px] transition group-hover:scale-105 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070c1a]">
              <Radar className="h-4.5 w-4.5 text-[#38bdf8]" strokeWidth={2.5} aria-hidden="true" />
            </div>
          </div>
          <span className="font-display text-2xl leading-none text-white transition group-hover:text-[#38bdf8]">
            Slaydar
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
            AI Wardrobe Agent
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="min-h-[44px] flex items-center gap-2 rounded-full px-4 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-[#38bdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] cursor-pointer"
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
