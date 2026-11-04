import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/component/admin/AdminLoginForm';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Sign in | BeU Admin',
  robots: { index: false, follow: false },
};

// Its own route group, not (admin): that group's layout calls requireAdmin(), which
// sends signed-out visitors here and would loop.
export default async function AdminLoginPage() {
  if ((await getCurrentUser())?.role === 'ADMIN') {
    redirect('/admin');
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background px-6 py-8 shadow-lg sm:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/Logo-Dark-Mark.png" alt="BeU" width={380} height={380} className="h-8 w-8" />
          <h1 className="font-bold uppercase tracking-wide">Admin</h1>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
