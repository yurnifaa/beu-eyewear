import type { OrderStatus } from '@prisma/client';
import { Check, Package, PartyPopper, Truck } from 'lucide-react';

export const STATUS_STEPS = [
  { label: 'Order Placed', icon: Check },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: PartyPopper },
];

// How far along STATUS_STEPS each order status is. CANCELLED isn't a step.
export const STEP_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

interface OrderStatusStepsProps {
  status: OrderStatus;
  className?: string;
  // "storefront" is the connected ice-blue stepper used on the account pages.
  // The default keeps the original neutral look (admin shares this component).
  variant?: 'default' | 'storefront';
}

export default function OrderStatusSteps({ status, className = '', variant = 'default' }: OrderStatusStepsProps) {
  if (status === 'CANCELLED') {
    return <p className={`text-sm font-semibold ${className}`}>This order was cancelled.</p>;
  }

  const currentStep = STEP_INDEX[status];

  if (variant === 'storefront') {
    return (
      <ol className={`grid grid-cols-4 ${className}`} aria-label="Order progress">
        {STATUS_STEPS.map(({ label, icon: Icon }, index) => {
          const complete = index <= currentStep;
          const current = index === currentStep;
          return (
            <li key={label} aria-current={current ? 'step' : undefined} className="relative flex flex-col items-center gap-3 text-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[-50%] top-5 -z-0 h-0.5 w-full ${index <= currentStep ? 'bg-accent' : 'bg-border'}`}
                />
              )}
              <span
                className={`relative z-10 grid size-11 place-items-center rounded-full border transition-colors ${
                  complete
                    ? 'border-transparent bg-ink text-white'
                    : 'border-border bg-background text-muted-foreground'
                } ${current ? 'ring-4 ring-accent/30' : ''}`}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <span
                className={`text-[10px] uppercase leading-snug tracking-[0.12em] md:text-[11px] ${complete ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

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
