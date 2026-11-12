import { getShippingMethodsForDisplay, getStoreSettings } from '@/lib/catalog/queries';
import { SHIPPING_METHODS } from '@/lib/checkout/shipping';

const DEFAULT_PHONES = ['(02) 8676-9420', '0912-345-6789'];

export interface SupportInfo {
  phones: string[];
  email?: string;
  social?: string;
  returnDays: number;
  shipping: { id: string; label: string; fee: number; minDays: number; maxDays: number }[];
}

// Support pages must never 500 because the sheet is down, so every value has a fallback
// (the same numbers the footer prints).
export async function getSupportInfo(): Promise<SupportInfo> {
  // These pages only describe the rates, so a minute-old copy is fine (checkout reads them live).
  const [settings, shipping] = await Promise.allSettled([getStoreSettings(), getShippingMethodsForDisplay()]);
  const s = settings.status === 'fulfilled' ? settings.value : undefined;

  return {
    phones: s && s.supportPhones.length > 0 ? s.supportPhones : DEFAULT_PHONES,
    email: s?.supportEmail,
    social: s?.socialHandle,
    returnDays: s?.returnWindowDays ?? 7,
    shipping:
      shipping.status === 'fulfilled' && shipping.value.length > 0
        ? shipping.value
        : Object.entries(SHIPPING_METHODS).map(([id, m]) => ({ id, ...m })),
  };
}

export const rangeLabel = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);
