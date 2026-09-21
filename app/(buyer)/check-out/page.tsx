import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Breadcrumb from '@/component/Breadcrumb';
import CheckoutForm from '@/component/CheckoutForm';
import Reveal from '@/component/Reveal';

export default function Page() {
  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <div className="hidden md:block">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/home' },
              { label: 'Listing', href: '/listing' },
              { label: 'Cart', href: '/cart' },
              { label: 'Checkout' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" aria-label="Back to cart">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold uppercase">Checkout</h1>
        </div>
      </Reveal>

      <Reveal mode="mount" className="px-6 py-8">
        <CheckoutForm />
      </Reveal>
    </>
  );
}
