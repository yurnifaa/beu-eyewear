import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import PixelGlyph from '@/component/beu/PixelGlyph';
import CheckoutForm from '@/component/CheckoutForm';
import Crumbs from '@/component/listing/Crumbs';
import Reveal from '@/component/Reveal';
import { requireUser } from '@/lib/auth/session';
import { getShippingMethods } from '@/lib/catalog/queries';
import { getSavedAddresses } from '@/lib/checkout/saved-address';

export default async function Page(props: PageProps<'/check-out'>) {
  const { line } = await props.searchParams;

  // The cart page sends the lines the buyer ticked as repeated ?line=slug::color
  // params. No params means the whole cart.
  const selectedKeys = line === undefined ? undefined : Array.isArray(line) ? line : [line];

  // Keep the selection through a sign-in round trip.
  const here = selectedKeys
    ? `/check-out?${new URLSearchParams(selectedKeys.map((key) => ['line', key])).toString()}`
    : '/check-out';
  const user = await requireUser(here);
  const [savedAddresses, shippingMethods] = await Promise.all([getSavedAddresses(user.id), getShippingMethods()]);

  return (
    // Ice band slides behind the floating header; the texture fades out before the bottom.
    <div className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_0%,#000_28%,transparent_70%)]">
        <div className="beu-band-grid absolute inset-0" />
        <div className="beu-band-dots absolute inset-0" />
      </div>
      <PixelGlyph name="cross" size={34} className="absolute right-[6%] top-[calc(var(--beu-header-h)+2rem)] z-[1] hidden text-foreground lg:block" />
      <PixelGlyph name="spark" size={40} className="absolute right-[14%] top-[calc(var(--beu-header-h)+6rem)] z-[1] hidden text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)] lg:block" />

      <div className="relative z-[2] mx-auto max-w-[1328px] px-6 pb-20 pt-[calc(var(--beu-header-h)+1.5rem)] md:px-14 lg:pb-28">
        <Reveal mode="mount">
          <div className="hidden md:block">
            <Crumbs
              crumbs={[
                { label: 'Home', href: '/home' },
                { label: 'Cart', href: '/cart' },
                { label: 'Checkout' },
              ]}
            />
          </div>
          <Link href="/cart" className="beu-chip inline-flex h-9 items-center gap-1.5 pl-3 pr-4 text-[11px] uppercase tracking-[0.14em] md:hidden">
            <ChevronLeft size={14} aria-hidden="true" />
            Cart
          </Link>
          <h1 className="mt-5 font-display text-4xl font-black uppercase leading-none tracking-[-0.04em] md:text-6xl">Checkout</h1>
        </Reveal>

        <Reveal mode="mount" className="mt-8 md:mt-10">
          <CheckoutForm
            defaultName={user.name}
            savedAddresses={savedAddresses}
            selectedKeys={selectedKeys}
            shippingMethods={shippingMethods}
          />
        </Reveal>
      </div>
    </div>
  );
}
