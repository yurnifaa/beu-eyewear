import type { Metadata } from 'next';
import Link from 'next/link';
import Panel from '@/component/account/Panel';
import Reveal from '@/component/Reveal';
import { ProseList, ProseSection } from '@/component/support/Prose';
import SupportHeader from '@/component/support/SupportHeader';
import { getSupportInfo, rangeLabel } from '@/component/support/support-info';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Shipping & Returns' };
// Delivery times, fees and the return window come from the store settings.
export const dynamic = 'force-dynamic';

const link = 'font-medium text-accent underline underline-offset-4';

// TODO(legal): this is plain-language draft copy built from the store's settings. Have the owner
// confirm the return conditions and any exclusions (e.g. prescription lenses) before launch.
export default async function ShippingReturnsPage() {
  const { shipping, returnDays } = await getSupportInfo();

  return (
    <Reveal mode="mount" className="flex flex-col gap-10 md:gap-12">
      <SupportHeader
        eyebrow="Policies"
        title="Shipping & returns"
        description="How your order gets to you, and how to send it back if it isn't right."
      />

      <Panel title="Shipping" index="01">
        <ProseSection title="Processing" index="1.1">
          <p>Orders are processed within 24 hours during working days. You&apos;ll see each step on your order page.</p>
        </ProseSection>
        <ProseSection title="Delivery options" index="1.2">
          <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2">
            {shipping.map((method) => (
              <li key={method.id} className="rounded-2xl border border-border bg-card/60 p-5">
                <p className="font-display text-base font-black uppercase tracking-[-0.01em]">{method.label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{method.fee === 0 ? 'Free' : formatPrice(method.fee)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {rangeLabel(method.minDays, method.maxDays)} business days
                </p>
              </li>
            ))}
          </ul>
          <p>Delivery times are estimates and start once your order has been processed.</p>
        </ProseSection>
      </Panel>

      <Panel title="Returns" index="02">
        <ProseSection title="Return window" index="2.1">
          <p>
            You can return an item within <strong className="text-foreground">{returnDays} days</strong> of delivery. Returns are free.
          </p>
        </ProseSection>
        <ProseSection title="What we can take back" index="2.2">
          <ProseList
            items={[
              'The item is in its original condition, with its case and packaging.',
              'It shows no signs of wear beyond trying it on.',
              'You have your order number to hand.',
            ]}
          />
        </ProseSection>
        <ProseSection title="How to start a return" index="2.3">
          <ProseList
            items={[
              <>
                Find the order in{' '}
                <Link href="/account/orders" className={link}>
                  your order history
                </Link>
                , then{' '}
                <Link href="/contact" className={link}>
                  contact us
                </Link>{' '}
                with the order number and the reason.
              </>,
              "We'll confirm and tell you how to send the item back.",
              'Once we receive and check it, we process your refund.',
            ]}
          />
        </ProseSection>
        <ProseSection title="Damaged or wrong item" index="2.4">
          <p>If something arrives damaged or isn&apos;t what you ordered, tell us as soon as possible with a photo and we&apos;ll put it right.</p>
        </ProseSection>
      </Panel>
    </Reveal>
  );
}
