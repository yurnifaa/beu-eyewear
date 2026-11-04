"use client";

import Link from "next/link";
import { buttonClassName } from "@/component/Button";
import { useCartCount } from "@/lib/cart";

export default function CartPill() {
  const count = useCartCount();

  // The shared small primary pill (Midnight Navy, lifts on hover), 44px tall for the touch target.
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className={buttonClassName({
        size: "sm",
        className: "h-11 shrink-0 whitespace-nowrap uppercase tracking-[0.14em] active:translate-y-0 active:scale-[0.97] max-[374px]:px-2.5 sm:px-4 md:px-5",
      })}
    >
      Cart ({count})
    </Link>
  );
}
