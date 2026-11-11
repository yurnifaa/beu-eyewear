"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import CartBadge from "@/component/CartBadge";
import { useCartCount } from "@/lib/cart";
import { CART_LANDED_EVENT, CART_TARGET_ATTR } from "@/lib/cart-fly";

export default function CartPill() {
  const count = useCartCount();
  const pathname = usePathname();
  const active = pathname === "/cart" || pathname.startsWith("/cart/");
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Pop the icon when the "+N" chip lands. Driven by an event rather than by the count changing,
  // so the count going 0 -> N on page load doesn't trigger it.
  useEffect(() => {
    const bump = () => {
      const el = linkRef.current;
      if (!el) return;
      el.classList.remove("beu-cart-bump");
      void el.offsetWidth; // restart the animation if it is already running
      el.classList.add("beu-cart-bump");
    };
    window.addEventListener(CART_LANDED_EVENT, bump);
    return () => window.removeEventListener(CART_LANDED_EVENT, bump);
  }, []);

  // Same Midnight Navy as the old pill so the main action keeps its weight beside the ghost icons;
  // 44px round for the touch target.
  return (
    <Link
      ref={linkRef}
      href="/cart"
      {...{ [CART_TARGET_ATTR]: "" }}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      onAnimationEnd={(event) => event.currentTarget.classList.remove("beu-cart-bump")}
      className={`beu-icon-btn relative shrink-0${active ? " bg-brand-700 text-on-brand hover:bg-brand-800" : ""}`}
    >
      <ShoppingCart size={20} strokeWidth={1.75} aria-hidden="true" />
      <CartBadge />
    </Link>
  );
}
