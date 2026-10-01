// Shared by the checkout form (display) and placeOrder (pricing). No
// 'use client'/'server-only' on purpose, and no @prisma/client import, so the
// client bundle never pulls in the database layer. The ids mirror the Prisma
// ShippingMethod enum.
export const SHIPPING_METHOD_IDS = ['STANDARD', 'EXPRESS'] as const;
export type ShippingMethodId = (typeof SHIPPING_METHOD_IDS)[number];

interface ShippingMethodInfo {
  label: string;
  fee: number;
  minDays: number;
  maxDays: number;
}

export const SHIPPING_METHODS: Record<ShippingMethodId, ShippingMethodInfo> = {
  STANDARD: { label: 'Standard', fee: 0, minDays: 3, maxDays: 5 },
  EXPRESS: { label: 'Express', fee: 150, minDays: 1, maxDays: 2 },
};

function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

function formatDay(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', ...options });
}

// e.g. "Oct 7–9", or "Oct 30–Nov 3" when the window crosses a month.
export function deliveryEstimate(method: ShippingMethodId, from: Date = new Date()): string {
  const { minDays, maxDays } = SHIPPING_METHODS[method];
  const earliest = addBusinessDays(from, minDays);
  const latest = addBusinessDays(from, maxDays);

  const start = formatDay(earliest, { month: 'short', day: 'numeric' });
  if (earliest.getTime() === latest.getTime()) return start;

  const sameMonth = formatDay(earliest, { month: 'short' }) === formatDay(latest, { month: 'short' });
  const end = formatDay(latest, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
  return `${start}–${end}`;
}
