import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import OrderStatusBadge from '@/component/order/OrderStatusBadge';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import type { getOrdersForUser } from '@/lib/orders/queries';
import type { OrderBucket } from '@/lib/orders/tabs';

type OrderSummary = Awaited<ReturnType<typeof getOrdersForUser>>[number];

const VISIBLE_ITEMS = 2;

export default function OrderCard({ order, bucket }: { order: OrderSummary; bucket: OrderBucket }) {
  const shown = order.items.slice(0, VISIBLE_ITEMS);
  const hidden = order.items.length - shown.length;
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

  return (
    <article className="rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">{formatOrderNumber(order.number)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Placed {orderDate}</p>
        </div>
        <OrderStatusBadge bucket={bucket} />
      </div>

      <ul className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
        {shown.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="min-w-0 truncate">
              {item.name}
              {item.color && <span className="text-muted-foreground"> · {item.color}</span>}
            </span>
            <span className="shrink-0 text-muted-foreground">×{item.quantity}</span>
          </li>
        ))}
        {hidden > 0 && (
          <li className="text-xs text-muted-foreground">
            +{hidden} more {hidden === 1 ? 'item' : 'items'}
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm">
          <span className="text-muted-foreground">Total </span>
          <span className="font-bold">{formatPrice(order.total)}</span>
        </p>
        <Link href={`/account/orders/${order.id}`} className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
          View Order
        </Link>
      </div>
    </article>
  );
}
