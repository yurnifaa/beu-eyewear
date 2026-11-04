import PixelGlyph from '@/component/beu/PixelGlyph';
import { deliveryEstimate, SHIPPING_METHODS } from '@/lib/checkout/shipping';
import type { OrderDetail } from '@/lib/orders/queries';

interface ShippingInfoCardProps {
  order: OrderDetail;
  className?: string;
  // "storefront" is the frosted account-page card. The default keeps the
  // original neutral look (admin shares this component).
  variant?: 'default' | 'storefront';
}

export default function ShippingInfoCard({ order, className = '', variant = 'default' }: ShippingInfoCardProps) {
  if (variant === 'storefront') {
    return (
      <div className={`rounded-3xl border border-border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur md:p-8 ${className}`}>
        <p className="flex items-center gap-2.5 font-display text-sm font-black uppercase tracking-[0.01em]">
          <PixelGlyph name="spark" size={16} className="text-accent" />
          Shipping to
        </p>
        <p className="mt-5 font-display text-lg font-black uppercase tracking-[-0.02em]">{order.shipName}</p>
        <address className="mt-2 text-sm not-italic leading-relaxed text-muted-foreground">
          <span className="break-words">{order.shipAddress}</span>
          <br />
          {order.shipCity}, {order.shipProvince} {order.shipZip}
          <br />
          {order.shipPhone}
        </address>
        <p className="mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-accent/10 px-4 py-2.5 text-[11px] uppercase leading-snug tracking-[0.12em]">
          <span>{SHIPPING_METHODS[order.shippingMethod].label} shipping</span>
          <span aria-hidden="true">·</span>
          <span>Est. arrival {deliveryEstimate(order.shippingMethod, order.createdAt)}</span>
        </p>
      </div>
    );
  }

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
