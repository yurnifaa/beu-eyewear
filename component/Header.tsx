import Image from "next/image";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
import ThemeToggle from "@/component/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <nav className="flex items-center gap-6">
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
        <button aria-label="Wishlist" type="button">
          <Heart size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Link href="/cart" aria-label="Cart">
            <ShoppingBag size={20} />
          </Link>
          <span aria-hidden="true" className="h-5 w-px bg-border" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
