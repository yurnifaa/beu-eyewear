import Link from 'next/link';
import { notFound } from 'next/navigation';
import PixelGlyph from '@/component/beu/PixelGlyph';
import Panel from '@/component/account/Panel';
import OrderStatusSteps from '@/component/order/OrderStatusSteps';
import OrderSummaryCard from '@/component/order/OrderSummaryCard';
import ShippingInfoCard from '@/component/order/ShippingInfoCard';
import Reveal from '@/component/Reveal';
import { requireUser } from '@/lib/auth/session';
import { formatOrderNumber } from '@/lib/format';
import { getOrderForUser } from '@/lib/orders/queries';

export default async function Page(props: PageProps<'/order-confirm/[id]'>) {
  const { id } = await props.params;
  const user = await requireUser(`/order-confirm/${id}`);

  // Scoped to the signed-in user, so someone else's order id is just a 404.
  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  return (
    <>
      <section className="beu-band-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
        <div aria-hidden="true" className="beu-band-grid absolute inset-0" />
        <div aria-hidden="true" className="beu-band-dots absolute inset-0" />
        <PixelGlyph name="burst" size={52} className="absolute left-[8%] top-[34%] z-[1] hidden text-foreground md:block" />
        <PixelGlyph name="spark" size={44} className="absolute right-[10%] top-[40%] z-[1] hidden text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)] md:block" />
        <PixelGlyph name="star5" size={34} className="absolute bottom-[18%] left-[16%] z-[1] hidden text-white lg:block" />
        <PixelGlyph name="cross" size={34} className="absolute bottom-[22%] right-[15%] z-[1] hidden text-foreground lg:block" />

        <Reveal
          mode="mount"
          className="relative z-[2] mx-auto max-w-[1328px] px-6 pb-14 pt-[calc(var(--beu-header-h)+2.5rem)] text-center md:px-14 md:pb-20"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            [ Order {formatOrderNumber(order.number)} confirmed ]
          </p>
          <h1 className="beu-chrome-text mt-6 font-display text-[clamp(2.6rem,11vw,8rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
            Thank you
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foreground/80">
            Your order has been received and will be processed within 24 hours during working days.
          </p>
        </Reveal>
      </section>

      <Reveal mode="mount" className="px-6 pb-24 pt-10 md:px-14 md:pt-14">
        <div className="mx-auto grid max-w-[1328px] grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <Panel title="Progress" index="01" className="py-8">
              <OrderStatusSteps status={order.status} variant="storefront" />
            </Panel>
            <ShippingInfoCard order={order} variant="storefront" />
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex h-12 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
              >
                Track your order
              </Link>
              <Link
                href="/listing"
                className="beu-chip inline-flex h-12 items-center px-7 text-xs uppercase tracking-[0.14em]"
              >
                Continue shopping
              </Link>
            </div>
          </div>
          <OrderSummaryCard order={order} />
        </div>
      </Reveal>
    </>
  );
}
