"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart";

export default function CartPill() {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-[11px] uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80 md:px-5 md:text-xs dark:bg-ice dark:text-ink"
    >
      Cart ({count})
    </Link>
  );
}
