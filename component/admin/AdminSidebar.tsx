'use client';

import type { ElementType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Boxes, LayoutDashboard, Package, ShoppingCart, Tags, Users, X } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Tags },
      { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

export interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname() ?? '/admin';

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-background transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2">
            <Image src="/Logo-Dark-Mark.png" alt="BeU" width={380} height={380} className="h-8 w-8 dark:hidden" />
            <Image src="/Logo-Light-Mark.png" alt="BeU" width={380} height={380} className="hidden h-8 w-8 dark:block" />
            <span className="font-bold uppercase tracking-wide">Admin</span>
          </Link>
          <button type="button" aria-label="Close menu" onClick={onClose} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <div className="mt-2 flex flex-col gap-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active ? 'bg-brand-700 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
