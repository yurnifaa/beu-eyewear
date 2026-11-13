'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import SearchBox from '@/component/SearchBox';

// The search field lives in the header pill itself and suggests products as you type. On phones there
// is no room for it next to the logo, menu and cart, so the icon links to the /search page, which has
// its own field (with the same suggestions). On /search itself the header search is hidden, so the
// page's centered field is the only one.
export default function HeaderSearch() {
  const pathname = usePathname();

  if (pathname.startsWith('/search')) return null;

  return (
    <>
      <Link href="/search" aria-label="Search" className="beu-icon-btn md:hidden">
        <Search size={20} strokeWidth={1.75} />
      </Link>

      {/* Keyed by path so the typed text and dropdown reset after a suggestion is opened. */}
      <SearchBox key={pathname} variant="header" />
    </>
  );
}
