"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function HeaderIconLink({
  href,
  label,
  excludePaths,
  className = "",
  children,
}: {
  href: string;
  label: string;
  excludePaths?: string[];
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const matches = pathname === href || pathname.startsWith(`${href}/`);
  const excluded = excludePaths?.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const active = matches && !excluded;

  return (
    <Link
      href={href}
      aria-label={label}
      className={`beu-icon-btn ${active ? "bg-brand-700 text-on-brand hover:bg-brand-800" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
