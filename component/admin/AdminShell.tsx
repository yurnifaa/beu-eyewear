'use client';

import { useState, type ReactNode } from 'react';
import AdminHeader from '@/component/admin/AdminHeader';
import AdminSidebar from '@/component/admin/AdminSidebar';

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full">
      <AdminSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
