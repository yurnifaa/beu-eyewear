import type { ReactNode } from 'react';
import Header from '@/component/Header';
import Footer from '@/component/Footer';

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
