"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/map", label: "Dashboard" },
  { href: "/venues", label: "Venues" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || (href === "/map" && pathname === "/");
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
