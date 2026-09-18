import Link from 'next/link';
import { Check, ChevronLeft, Package, PartyPopper, Truck } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import Reveal from '@/component/Reveal';

const ITEMS = [
  { name: 'Frames', variant: 'Color / Anti Radiation', qty: 1, price: 1500 },
  { name: 'Frames', variant: 'Color / Anti Radiation', qty: 1, price: 1500 },
];

const SHIPPING = 0;

const STATUS_STEPS = [
  { label: 'Order Placed', icon: Check, complete: true },
  { label: 'Processing', icon: Package, complete: false },
  { label: 'Shipped', icon: Truck, complete: false },
  { label: 'Delivered', icon: PartyPopper, complete: false },
];

function formatPrice(amount: number) {
  return `₱${amount.toLocaleString('en-PH')}`;
}

export default function Page() {
  const subtotal = ITEMS.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + SHIPPING;
  const orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
            Your order will be processed within 24 hours during working days. We will notify you by email once
            your order has been shipped.
          </p>

          <div className="mt-16 flex flex-wrap justify-between">
            {STATUS_STEPS.map(({ label, icon: Icon, complete }) => (
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
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button type="button" className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
              Track your Order
            </button>
            <Link href="/listing" className="text-sm text-muted-foreground underline hover:text-foreground">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="rounded-xl bg-muted p-6">
            <AccordionSection title="Order Summary" defaultOpen>
              <div className="flex flex-col gap-4">
                {ITEMS.map((item, i) => (
                  <div key={i} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <PlaceholderImage variant="plain" className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="flex flex-1 items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="shrink-0 text-sm">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between border-b border-border pb-4 text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{SHIPPING === 0 ? 'Free' : formatPrice(SHIPPING)}</span>
              </div>
              <div className="mt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="mt-1">{orderDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="mt-1">#ORD-000123</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="mt-1">Card</p>
                </div>
              </div>
            </AccordionSection>
          </div>
        </div>
      </Reveal>
    </>
  );
}
