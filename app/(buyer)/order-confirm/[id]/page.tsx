import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ChevronLeft, Package, PartyPopper, Truck } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import Reveal from '@/component/Reveal';
import { requireUser } from '@/lib/auth/session';
import { PAYMENT_METHOD_LABELS } from '@/lib/checkout/payment';
import { deliveryEstimate, SHIPPING_METHODS } from '@/lib/checkout/shipping';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import { prisma } from '@/lib/prisma';

const STATUS_STEPS = [
  { label: 'Order Placed', icon: Check },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: PartyPopper },
];

// How far along STATUS_STEPS each order status is. CANCELLED isn't a step.
const STEP_INDEX = { PENDING: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 } as const;

export default async function Page(props: PageProps<'/order-confirm/[id]'>) {
  const { id } = await props.params;
  const user = await requireUser(`/order-confirm/${id}`);

  // Scoped to the signed-in user, so someone else's order id is just a 404.
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { id: 'asc' } } },
  });
  if (!order) notFound();

  const currentStep = STEP_INDEX[order.status];
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Link href="/home" className="flex items-center gap-2">
          <ChevronLeft size={20} />
          <span className="text-xl font-bold uppercase">Home</span>
        </Link>
      </Reveal>

      <Reveal mode="mount" className="grid grid-cols-1 gap-8 px-6 pt-8 pb-24 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold uppercase md:text-5xl">Thank You For Your Purchase!</h1>
          <p className="mt-4 text-muted-foreground">
            Your order has been received and will be processed within 24 hours during working days.
          </p>

          {order.status === 'CANCELLED' ? (
            <p className="mt-16 text-sm font-semibold">This order was cancelled.</p>
          ) : (
            <div className="mt-16 flex flex-wrap justify-between">
              {STATUS_STEPS.map(({ label, icon: Icon }, index) => {
                const complete = index <= currentStep;
                return (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        complete ? 'bg-foreground text-background' : 'border border-border text-muted-foreground'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className={`text-xs ${complete ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 rounded-xl border border-border p-6">
            <p className="text-sm font-semibold uppercase tracking-wide">Shipping To</p>
            <p className="mt-3 text-sm font-semibold">{order.shipName}</p>
            <p className="text-sm text-muted-foreground">{order.shipAddress}</p>
            <p className="text-sm text-muted-foreground">
              {order.shipCity}, {order.shipProvince} {order.shipZip}
            </p>
            <p className="text-sm text-muted-foreground">{order.shipPhone}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {SHIPPING_METHODS[order.shippingMethod].label} shipping · Estimated arrival{' '}
              {deliveryEstimate(order.shippingMethod, order.createdAt)}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href={`/account/orders/${order.id}`}
              className={buttonClassName({ variant: 'primary', className: 'uppercase' })}
            >
              Track your Order
            </Link>
            <Link href="/listing" className="text-sm text-muted-foreground underline hover:text-foreground">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="rounded-xl bg-muted p-6">
            <AccordionSection title="Order Summary" defaultOpen>
              <div className="flex flex-col gap-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <PlaceholderImage variant="plain" className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="flex flex-1 items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between border-b border-border pb-4 text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="mt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="mt-1">{orderDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="mt-1">{formatOrderNumber(order.number)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="mt-1">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                  <p className="text-muted-foreground">{order.paymentStatus === 'PAID' ? 'Paid' : 'Payment pending'}</p>
                </div>
              </div>
            </AccordionSection>
          </div>
        </div>
      </Reveal>
    </>
  );
}
