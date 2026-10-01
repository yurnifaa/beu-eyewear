import { deliveryEstimate, SHIPPING_METHODS } from '@/lib/checkout/shipping';
import type { OrderDetail } from '@/lib/orders/queries';

export default function ShippingInfoCard({ order, className = '' }: { order: OrderDetail; className?: string }) {
  return (
    <div className={`rounded-xl border border-border p-6 ${className}`}>
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
  );
}
