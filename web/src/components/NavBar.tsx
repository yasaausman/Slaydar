import Link from "next/link";
import { Radar, Upload, Shirt, CalendarCheck } from "lucide-react";

const LINKS = [
  { href: "/upload", label: "Upload", Icon: Upload },
  { href: "/closet", label: "Closet", Icon: Shirt },
  { href: "/checkin", label: "Check in", Icon: CalendarCheck },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0c0b14]/75 border-b border-[#c0c0c0]/25 shadow-2xl shadow-black/50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-3 group cursor-pointer rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
        >
          <div className="y2k-chrome-border relative flex h-9 w-9 items-center justify-center rounded-xl transition group-hover:scale-105 shadow-[0_0_16px_rgba(204,255,0,0.35)]">
            <Radar className="h-4.5 w-4.5 text-[#ccff00]" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <span className="chrome-text font-display text-2xl leading-none">Slaydar</span>
          <span className="y2k-sticker hidden text-[10px] sm:inline-flex">
            <span aria-hidden="true">✨</span> Future Is Now
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-full border border-[#c0c0c0]/25 bg-white/[0.03] p-1">
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="min-h-[40px] flex items-center gap-2 rounded-full px-4 text-xs font-extrabold uppercase tracking-wider text-[#e6e6fa] transition hover:bg-[#ccff00]/15 hover:text-[#ccff00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] cursor-pointer"
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
