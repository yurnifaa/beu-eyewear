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
    // overflow-x-auto keeps the tabs usable on a phone: the strip scrolls
    // inside this box instead of stretching the page.
    <nav aria-label="Order status" className="-m-1 overflow-x-auto p-1">
      <ul className="flex min-w-max gap-2">
        {ORDER_TABS.map(({ id, label }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <Link
                href={id === 'all' ? '/account/orders' : `/account/orders?tab=${id}`}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                className="beu-chip flex h-10 items-center gap-2 px-5 text-xs uppercase tracking-[0.12em] whitespace-nowrap"
              >
                {label}
                {counts[id] > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-current/15 px-1.5 text-[10px] leading-5">
                    {counts[id]}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
