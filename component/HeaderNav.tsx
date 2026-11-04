"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/component/nav-links";

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-6 text-xs uppercase tracking-[0.12em] lg:flex xl:gap-8">
      {NAV_LINKS.map(({ href, label }) => {
        // Only plain paths can be "active"; links with ?query or #hash never are.
        const plain = !href.includes("?") && !href.includes("#");
        const active = plain && (pathname === href || pathname.startsWith(`${href}/`));

        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-1 transition-opacity hover:opacity-70 ${active ? "border-current" : "border-transparent"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
