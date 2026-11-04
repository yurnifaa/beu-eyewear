'use client';

import { useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

// The search field lives in the header pill itself (no popup). On phones there is no room for it
// next to the logo, menu and cart, so the icon links to the /search page, which has its own field.
export default function HeaderSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? '';
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <>
      <Link href="/search" aria-label="Search" className="beu-icon-btn md:hidden">
        <Search size={20} strokeWidth={1.75} />
      </Link>

      <form role="search" onSubmit={handleSubmit} className="hidden md:block">
        <label htmlFor="header-search-input" className="sr-only">
          Search products
        </label>
        <div className="flex h-10 w-52 items-center gap-1 rounded-full border border-border bg-card/70 pl-1 pr-4 transition-colors duration-150 focus-within:border-accent focus-within:bg-background lg:w-56 xl:w-64">
          <button type="submit" aria-label="Search" className="beu-icon-btn size-8 shrink-0 text-muted-foreground hover:text-foreground">
            <Search size={16} strokeWidth={1.75} />
          </button>
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            name="q"
            placeholder="Search frames..."
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </form>
    </>
  );
}
