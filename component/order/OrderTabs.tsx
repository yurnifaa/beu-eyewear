import Link from 'next/link';
import { ORDER_TABS, type OrderTabId } from '@/lib/orders/tabs';

interface OrderTabsProps {
  active: OrderTabId;
  counts: Record<OrderTabId, number>;
}

// Plain links (?tab=...) rather than client state: the active tab survives a
// reload, can be shared, and works with the back button.
export default function OrderTabs({ active, counts }: OrderTabsProps) {
  return (
    // overflow-x-auto keeps five tabs usable on a phone: the strip scrolls
    // inside this box instead of stretching the page.
    <nav aria-label="Order status" className="overflow-x-auto border-b border-border">
      <ul className="flex min-w-max gap-6">
        {ORDER_TABS.map(({ id, label }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <Link
                href={id === 'all' ? '/account/orders' : `/account/orders?tab=${id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-foreground font-semibold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                {counts[id] > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">{counts[id]}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
