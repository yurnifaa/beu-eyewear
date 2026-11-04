"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/component/nav-links";

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map(({ href, label }) => {
        // Only plain paths can be "active"; links with ?query or #hash never are.
        const plain = !href.includes("?") && !href.includes("#");
        const active = plain && (pathname === href || pathname.startsWith(`${href}/`));

        // Label style (DM Mono 500, 0.18em) in a pill target: a soft accent wash on hover,
        // the Ice selection fill when current.
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-10 items-center rounded-full px-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 xl:px-3.5 ${
              active ? "bg-ice shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" : "hover:bg-accent/15"
            }`}
          >
            {/* Trailing letter-spacing would push the label off-centre in its pill. */}
            <span className="-mr-[0.18em]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
