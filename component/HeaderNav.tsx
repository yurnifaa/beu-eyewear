"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/home", label: "Home" },
  { href: "/listing", label: "Shop" },
  { href: "/search", label: "Explore" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:bg-accent/15 ${active ? "bg-ink text-white dark:bg-ice dark:text-ink" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
