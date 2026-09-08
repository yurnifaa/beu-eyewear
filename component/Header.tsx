import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <nav className="flex items-center gap-6">
        <Link href="/listing" className="text-sm">
          Shop
        </Link>
        <Link href="/listing" className="text-sm">
          Explore
        </Link>
      </nav>

      <Link href="/home" className="font-serif text-2xl">
        BeU
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
        <Link href="/cart" aria-label="Cart">
          <ShoppingBag size={20} />
        </Link>
      </div>
    </header>
  );
}
