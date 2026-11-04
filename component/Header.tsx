import Image from "next/image";
import Link from "next/link";
import { User, Heart, ShoppingBag, LayoutDashboard } from "lucide-react";
import MobileMenu from "@/component/MobileMenu";
import CartBadge from "@/component/CartBadge";
import HeaderSearch from "@/component/HeaderSearch";
import HeaderNav from "@/component/HeaderNav";
import LoginModalTrigger from "@/component/LoginModalTrigger";
import ThemeToggle from "@/component/ThemeToggle";
import WishlistBadge from "@/component/WishlistBadge";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Header() {
  // Signed in: user icon goes to /account. Signed out: opens the login modal.
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-2 md:px-8">
        <div className="flex items-center">
          <MobileMenu links={[
            { href: "/home", label: "Home" },
            { href: "/listing", label: "Shop" },
            { href: "/search", label: "Explore" },
          ]} />
          <HeaderNav />
        </div>

        <Link href="/home" aria-label="BeU home" className="flex items-center justify-center">
          <Image
            src="/Logo-Dark-Mark.png"
            alt="BeU"
            width={380}
            height={380}
            priority
            className="h-12 w-12 dark:hidden"
          />
          <Image
            src="/Logo-Light-Mark.png"
            alt="BeU"
            width={380}
            height={380}
            priority
            className="hidden h-12 w-12 dark:block"
          />
        </Link>

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <HeaderSearch />
          {user?.role === "ADMIN" && (
            <Link href="/admin" aria-label="Admin" className="beu-icon-btn">
              <LayoutDashboard size={20} strokeWidth={1.75} />
            </Link>
          )}
          {user ? (
            <Link href="/account" aria-label="Account" className="beu-icon-btn">
              <User size={20} strokeWidth={1.75} />
            </Link>
          ) : (
            <LoginModalTrigger />
          )}
          <Link href="/account/wishlist" aria-label="Wishlist" className="beu-icon-btn relative hidden md:inline-flex">
            <Heart size={20} strokeWidth={1.75} />
            <WishlistBadge />
          </Link>
          <Link href="/cart" aria-label="Cart" className="beu-icon-btn relative">
            <ShoppingBag size={20} strokeWidth={1.75} />
            <CartBadge />
          </Link>
          <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border md:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
