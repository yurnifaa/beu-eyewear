'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, LayoutGrid, MapPin, Package, UserRound } from 'lucide-react';

const LINKS = [
  { href: '/account', label: 'Overview', icon: LayoutGrid },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
] as const;

// A pill row on phones (scrolls sideways), a stacked list from lg up.
export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation" className="-m-1 flex gap-2 overflow-x-auto p-1 lg:flex-col lg:overflow-visible">
      {LINKS.map(({ href, label, icon: Icon }, i) => {
        const active = href === '/account' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-active={active}
            aria-current={active ? 'page' : undefined}
            className="beu-chip flex h-12 shrink-0 items-center gap-3 px-5 text-xs uppercase tracking-[0.12em]"
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            <span aria-hidden="true" className="ml-auto hidden pl-4 text-[10px] opacity-60 lg:inline">
              0{i + 1}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
