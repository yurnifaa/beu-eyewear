import type { StoreSettings } from './types';

// The store settings the shop and the admin Settings page know about. The StoreSetting
// table is a plain key/value list; anything else stored there is ignored.
export const SETTING_FIELDS = [
  { key: 'store_name', label: 'Store name', hint: 'Shown in the browser tab and emails.', kind: 'text', fallback: 'BeU Eyewear' },
  { key: 'store_tagline', label: 'Tagline', hint: '', kind: 'text', fallback: 'Be Your Best Self' },
  { key: 'low_stock_threshold', label: 'Low-stock threshold', hint: 'At or below this many units a product shows as low stock.', kind: 'number', fallback: '5' },
  { key: 'catalog_page_size', label: 'Products per page', hint: 'Page size of the shop listing.', kind: 'number', fallback: '8' },
  { key: 'return_window_days', label: 'Return window (days)', hint: 'Used by products that do not set their own.', kind: 'number', fallback: '7' },
  { key: 'warranty_years_standard', label: 'Standard warranty (years)', hint: '', kind: 'number', fallback: '1' },
  { key: 'warranty_years_smart', label: 'Smart glasses warranty (years)', hint: '', kind: 'number', fallback: '5' },
  { key: 'student_discount_pct', label: 'Student discount (%)', hint: '', kind: 'number', fallback: '5' },
  { key: 'eyewear_kit_description', label: 'Eyewear kit description', hint: 'What the free kit includes.', kind: 'text', fallback: '' },
  { key: 'benefit_1', label: 'Benefits bar, first', hint: 'The three trust badges under the featured products.', kind: 'text', fallback: 'Free Eyewear Kit Included' },
  { key: 'benefit_2', label: 'Benefits bar, second', hint: '', kind: 'text', fallback: '7-Day Free Returns' },
  { key: 'benefit_3', label: 'Benefits bar, third', hint: '', kind: 'text', fallback: 'Up To 5-Year Warranty' },
  { key: 'support_email', label: 'Support email', hint: 'Shown in the footer.', kind: 'text', fallback: '' },
  { key: 'support_phone_landline', label: 'Support phone (landline)', hint: '', kind: 'text', fallback: '' },
  { key: 'support_phone_mobile', label: 'Support phone (mobile)', hint: '', kind: 'text', fallback: '' },
  { key: 'website', label: 'Website', hint: '', kind: 'text', fallback: '' },
  { key: 'social_handle', label: 'Social handle', hint: '', kind: 'text', fallback: '' },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]['key'];

const DEFAULT_BENEFITS = ['Free Eyewear Kit Included', '7-Day Free Returns', 'Up To 5-Year Warranty'];

function number(value: string | undefined): number | undefined {
  const cleaned = (value ?? '').replace(/[,\s]/g, '');
  if (cleaned === '') return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildStoreSettings(rows: { key: string; value: string }[]): StoreSettings {
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const text = (key: string) => map.get(key)?.trim() || undefined;
  const benefits = [text('benefit_1'), text('benefit_2'), text('benefit_3')].filter((value): value is string => Boolean(value));
  return {
    storeName: text('store_name') ?? 'BeU Eyewear',
    lowStockThreshold: number(map.get('low_stock_threshold')) ?? 5,
    pageSize: Math.max(1, number(map.get('catalog_page_size')) ?? 8),
    returnWindowDays: number(map.get('return_window_days')) ?? 7,
    benefits: benefits.length > 0 ? benefits : DEFAULT_BENEFITS,
    supportEmail: text('support_email'),
    supportPhones: [text('support_phone_landline'), text('support_phone_mobile')].filter((value): value is string => Boolean(value)),
    website: text('website'),
    socialHandle: text('social_handle'),
  };
}
