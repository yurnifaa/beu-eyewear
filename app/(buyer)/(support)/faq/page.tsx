import type { Metadata } from 'next';
import Link from 'next/link';
import Panel from '@/component/account/Panel';
import Reveal from '@/component/Reveal';
import FaqList, { type FaqItem } from '@/component/support/FaqList';
import SupportHeader from '@/component/support/SupportHeader';
import { getSupportInfo, rangeLabel } from '@/component/support/support-info';
import { PAYMENT_PROVIDER_NAME } from '@/lib/checkout/payment';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'FAQ' };
// Delivery times and the return window come from the store settings.
export const dynamic = 'force-dynamic';

const link = 'font-medium text-accent underline underline-offset-4';

export default async function FaqPage() {
  const { shipping, returnDays } = await getSupportInfo();

  const delivery = shipping
    .map((m) => `${m.label} (${m.fee === 0 ? 'free' : formatPrice(m.fee)}, ${rangeLabel(m.minDays, m.maxDays)} business days)`)
    .join(' and ');

  const orders: FaqItem[] = [
    {
      q: 'How long until my order ships?',
      a: 'Orders are processed within 24 hours during working days.',
    },
    { q: 'What delivery options do you offer?', a: `We offer ${delivery}. You choose at checkout.` },
    {
      q: 'How do I track my order?',
      a: (
        <>
          Open{' '}
          <Link href="/account/orders" className={link}>
            your order history
          </Link>{' '}
          to see each order&apos;s current step, from placed to delivered.
        </>
      ),
    },
    {
      q: 'Can I cancel an order?',
      a: 'Yes, from the order page, as long as the order is unpaid and hasn\'t shipped yet. Once an order is paid or shipped it can\'t be cancelled online; contact us or use our returns policy instead.',
    },
  ];

  const payments: FaqItem[] = [
    {
      q: 'Which payment methods can I use?',
      a: `You can pay by Visa or Mastercard, or with GCash. Payment is handled securely by ${PAYMENT_PROVIDER_NAME}, so we never see or store your card details.`,
    },
    {
      q: 'What happens if I don\'t finish paying?',
      a: 'Your order is saved and your items are held for you. You can pay any time from the order page, using Pay now. If an order is still unpaid after 24 hours it is cancelled automatically and the items go back on sale.',
    },
    {
      q: 'Do I need an account to check out?',
      a: 'Yes. An account lets you save addresses, track orders and keep a wishlist. Signing up takes under a minute.',
    },
  ];

  const returns: FaqItem[] = [
    {
      q: 'What is your return policy?',
      a: (
        <>
          Free returns within {returnDays} days of delivery for items in their original condition. Full details are in{' '}
          <Link href="/policies/shipping-returns" className={link}>
            Shipping &amp; Returns
          </Link>
          .
        </>
      ),
    },
    {
      q: 'My frame arrived damaged. What do I do?',
      a: (
        <>
          Tell us as soon as you can through the{' '}
          <Link href="/contact" className={link}>
            contact page
          </Link>{' '}
          with your order number and a photo, and we&apos;ll make it right.
        </>
      ),
    },
  ];

  const account: FaqItem[] = [
    {
      q: 'I forgot my password.',
      a: (
        <>
          Use{' '}
          <Link href="/forgot-password" className={link}>
            Forgot password
          </Link>{' '}
          and we&apos;ll email you a reset link. It works once and expires after an hour.
        </>
      ),
    },
    {
      q: 'I never got my confirmation email.',
      a: 'Check your spam folder first. You can request a new link any time from the verification section of your profile. Confirmation links expire after 24 hours.',
    },
    {
      q: 'Where is my wishlist saved?',
      a: 'In this browser, so it is there when you come back on the same device.',
    },
  ];

  const groups = [
    { title: 'Orders & delivery', items: orders },
    { title: 'Payments', items: payments },
    { title: 'Returns', items: returns },
    { title: 'Your account', items: account },
  ];

  return (
    <Reveal mode="mount" className="flex flex-col gap-10 md:gap-12">
      <SupportHeader
        eyebrow="FAQ"
        title="Quick answers."
        description={
          <>
            Can&apos;t find what you need? <Link href="/contact" className={link}>Get in touch</Link>.
          </>
        }
      />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        {groups.map((group, i) => (
          <Panel key={group.title} title={group.title} index={`0${i + 1}`}>
            <FaqList items={group.items} />
          </Panel>
        ))}
      </div>
    </Reveal>
  );
}
