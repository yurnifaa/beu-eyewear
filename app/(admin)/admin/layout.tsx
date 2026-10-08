import type { ReactNode } from 'react';
import AdminShell from '@/component/admin/AdminShell';
import { requireAdmin } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
