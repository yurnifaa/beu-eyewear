import type { OrderStatus } from '@prisma/client';
import { Check, Package, PartyPopper, Truck } from 'lucide-react';

const STATUS_STEPS = [
  { label: 'Order Placed', icon: Check },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: PartyPopper },
];

// How far along STATUS_STEPS each order status is. CANCELLED isn't a step.
const STEP_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

export default function OrderStatusSteps({ status, className = '' }: { status: OrderStatus; className?: string }) {
  if (status === 'CANCELLED') {
    return <p className={`text-sm font-semibold ${className}`}>This order was cancelled.</p>;
  }

  const currentStep = STEP_INDEX[status];

  return (
    <div className={`flex flex-wrap justify-between gap-y-4 ${className}`}>
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
  );
}
