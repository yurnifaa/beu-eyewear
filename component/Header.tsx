import Image from "next/image";
import Link from "next/link";
import { Menu, Search, User, Heart, ShoppingBag } from "lucide-react";
import ThemeToggle from "@/component/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-6 py-4">
      {/* Mobile nav drawer intentionally not wired up yet — lowfi pass */}
      <button aria-label="Menu" type="button" className="md:hidden">
        <Menu size={22} />
      </button>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/listing" className="text-sm">
          Shop
        </Link>
        <Link href="/listing" className="text-sm">
          Explore
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
        <button aria-label="Search" type="button">
          <Search size={20} />
        </button>
        <button aria-label="Account" type="button">
          <User size={20} />
        </button>
        <button aria-label="Wishlist" type="button" className="hidden md:block">
          <Heart size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Link href="/cart" aria-label="Cart">
            <ShoppingBag size={20} />
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
