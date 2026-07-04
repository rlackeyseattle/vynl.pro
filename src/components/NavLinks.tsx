"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const links = [
  { href: "/map", label: "Dashboard" },
  { href: "/venues", label: "Venues" },
  { href: "/pilot", label: "Booking Agent" },
  { href: "/discover", label: "Match & Book", highlight: true },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map(({ href, label, highlight }) => {
        const active = pathname === href || (href === "/map" && pathname === "/");
        if (highlight) {
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "bg-gradient-to-r from-pink-600 to-indigo-600 border-transparent text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  : "border-pink-500/50 text-pink-400 hover:bg-pink-950/40 hover:border-pink-400"
              }`}
            >
              <Zap className="w-3 h-3" />
              {label}
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors pb-[19px] mt-[19px] border-b-2 ${
              active
                ? "text-cyan-400 border-cyan-400"
                : "text-zinc-400 hover:text-white border-transparent"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
