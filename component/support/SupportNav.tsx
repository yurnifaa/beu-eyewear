'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SUPPORT_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/policies/shipping-returns', label: 'Shipping & Returns' },
  { href: '/policies/terms-privacy', label: 'Terms & Privacy' },
  { href: '/vouchers', label: 'Vouchers' },
] as const;

// Chip row that scrolls sideways on phones.
export default function SupportNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Help and info" className="-m-1 flex gap-2 overflow-x-auto p-1">
      {SUPPORT_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            data-active={active}
            aria-current={active ? 'page' : undefined}
            className="beu-chip inline-flex h-10 shrink-0 items-center px-5 text-xs uppercase tracking-[0.12em]"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
