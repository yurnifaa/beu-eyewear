import Link from 'next/link';
import type { ReactNode } from 'react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/reports', label: 'Reports' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b p-6 md:w-60 md:border-b-0 md:border-r">
        <nav aria-label="Admin navigation" className="flex flex-col gap-3">
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b px-6 py-4">
          <p>Admin</p>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}