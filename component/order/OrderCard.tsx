import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import OrderStatusBadge from '@/component/order/OrderStatusBadge';
import { STATUS_STEPS, STEP_INDEX } from '@/component/order/OrderStatusSteps';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import type { getOrdersForUser } from '@/lib/orders/queries';
import type { OrderBucket } from '@/lib/orders/tabs';

type OrderSummary = Awaited<ReturnType<typeof getOrdersForUser>>[number];

const VISIBLE_ITEMS = 2;

export default function OrderCard({ order, bucket }: { order: OrderSummary; bucket: OrderBucket }) {
  const shown = order.items.slice(0, VISIBLE_ITEMS);
  const hidden = order.items.length - shown.length;
  const step = STEP_INDEX[order.status];
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

  return (
    <article className="rounded-3xl border border-border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(40,100,180,0.16)] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="whitespace-nowrap font-display text-lg font-black uppercase tracking-[-0.02em] md:text-xl">{formatOrderNumber(order.number)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Placed {orderDate}</p>
        </div>
        <OrderStatusBadge bucket={bucket} />
      </div>

      {step >= 0 && (
        <div className="mt-5">
          <div aria-hidden="true" className="grid grid-cols-4 gap-1.5">
            {STATUS_STEPS.map(({ label }, i) => (
              <span key={label} className={`h-1.5 rounded-full ${i <= step ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{STATUS_STEPS[step].label}</p>
        </div>
      )}

      <ul className="mt-5 flex flex-col gap-1.5 border-t border-border pt-5 text-sm">
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

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
        <p>
          <span className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total</span>
          <span className="font-display text-2xl font-black tracking-[-0.03em]">{formatPrice(order.total)}</span>
        </p>
        <Link
          href={`/account/orders/${order.id}`}
          className="beu-chip inline-flex h-11 items-center gap-2 px-5 text-[11px] uppercase tracking-[0.12em]"
        >
          View order
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
