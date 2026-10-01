import AccordionSection from '@/component/AccordionSection';
import PlaceholderImage from '@/component/PlaceholderImage';
import { PAYMENT_METHOD_LABELS } from '@/lib/checkout/payment';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import type { OrderDetail } from '@/lib/orders/queries';

export default function OrderSummaryCard({ order }: { order: OrderDetail }) {
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

  return (
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
  );
}
