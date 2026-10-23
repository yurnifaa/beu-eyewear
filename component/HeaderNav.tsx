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
    <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`text-[15px] underline-offset-4 decoration-1 hover:underline ${active ? "underline" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
