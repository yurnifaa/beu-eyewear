'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { applyStockAdjustment, stockAdjustmentSchema, type StockFormState } from '@/lib/admin/inventory';

export async function adjustStock(sku: string, _previous: StockFormState, formData: FormData): Promise<StockFormState> {
  const admin = await requireAdmin();
  const text = (key: string) => (typeof formData.get(key) === 'string' ? String(formData.get(key)) : '');
  const values = { mode: text('mode'), amount: text('amount') };
  const parsed = stockAdjustmentSchema.safeParse({ sku, ...values, reason: text('reason') });
  if (!parsed.success) return { values, error: 'Use a whole number from 0 to 100,000 for Set stock, or -100,000 to +100,000 for Adjust by.' };

  let result;
  try {
    result = await applyStockAdjustment(parsed.data, admin.id);
  } catch {
    return { values, error: 'We couldn’t adjust stock. Please try again.' };
  }
  if (!result.ok) {
    return {
      values,
      error:
        result.reason === 'missing'
          ? 'This color no longer exists. Refresh the page.'
          : 'That would put stock outside 0–100,000. Refresh and try again.',
    };
  }

  // The storefront caches stock for up to a minute, so clear that too.
  for (const path of ['/admin/inventory', '/admin', '/admin/products']) revalidatePath(path);
  refreshCatalog();
  return { message: `Stock is now ${result.after.toLocaleString('en-PH')}.` };
}
