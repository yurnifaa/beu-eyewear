import AccordionSection from '@/component/AccordionSection';
import ProductImage from '@/component/ProductImage';
import { PAYMENT_METHOD_LABELS } from '@/lib/checkout/payment';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import { getOrderItemImages, type OrderDetail } from '@/lib/orders/queries';

// Used by the order page and the order-confirmation page, so it fetches its own item photos.
export default async function OrderSummaryCard({ order }: { order: OrderDetail }) {
  const images = await getOrderItemImages(order.items);
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur md:p-7 lg:sticky lg:top-28 lg:self-start">
      <AccordionSection title="Order Summary" defaultOpen>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
              {/* Plain white tile (not the blue stage): the photos are shot on white. */}
              <ProductImage
                imageUrl={images[item.id]}
                alt={item.name}
                sizes="64px"
                objectFit="contain"
                className="size-16 shrink-0 rounded-2xl bg-white!"
              />
              <div className="flex flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  {item.color && <p className="mt-0.5 text-xs">Color: {item.color}</p>}
                  <p className="text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm text-foreground">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between border-b border-border pb-4 text-sm">
          <span>Shipping</span>
          <span className="text-foreground">{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
        </div>
        <div className="mt-4 flex items-baseline justify-between text-foreground">
          <span className="text-[11px] uppercase tracking-[0.16em]">Total</span>
          <span className="font-display text-2xl font-black tracking-[-0.03em]">{formatPrice(order.total)}</span>
        </div>

        <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-4 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-[10px] uppercase tracking-[0.14em]">Date</dt>
            <dd className="text-right text-foreground">{orderDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[10px] uppercase tracking-[0.14em]">Order No.</dt>
            <dd className="text-right text-foreground">{formatOrderNumber(order.number)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[10px] uppercase tracking-[0.14em]">Payment</dt>
            <dd className="text-right text-foreground">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              <span className="block text-muted-foreground">{order.paymentStatus === 'PAID' ? 'Paid' : 'Payment pending'}</span>
            </dd>
          </div>
        </dl>
      </AccordionSection>
    </div>
  );
}
