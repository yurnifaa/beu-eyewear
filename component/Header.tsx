import Image from "next/image";
import Link from "next/link";
import { Menu, User, Heart, ShoppingBag } from "lucide-react";
import CartBadge from "@/component/CartBadge";
import HeaderSearch from "@/component/HeaderSearch";
import ThemeToggle from "@/component/ThemeToggle";
import WishlistBadge from "@/component/WishlistBadge";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-6 py-4">
      {/* Mobile nav drawer intentionally not wired up yet — lowfi pass */}
      <button aria-label="Menu" type="button" className="md:hidden">
        <Menu size={22} />
      </button>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/home" className="text-sm">
          Home
        </Link>
        <Link href="/listing" className="text-sm">
          Shop
        </Link>
      </nav>

      <Link href="/home">
        <Image
          src="/Logo-Dark-Mark.png"
          alt="BeU"
          width={380}
          height={380}
          priority
          className="h-14 w-14 dark:hidden"
        />
        <Image
          src="/Logo-Light-Mark.png"
          alt="BeU"
          width={380}
          height={380}
          priority
          className="hidden h-14 w-14 dark:block"
        />
      </Link>

      <div className="flex items-center gap-4">
        <HeaderSearch />
        <Link href="/account" aria-label="Account">
          <User size={20} />
        </Link>
        <Link href="/account/wishlist" aria-label="Wishlist" className="relative hidden md:block">
          <Heart size={20} />
          <WishlistBadge />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={20} />
            <CartBadge />
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
