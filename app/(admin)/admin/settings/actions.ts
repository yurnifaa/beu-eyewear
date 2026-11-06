'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { formValues, type ConfigFormState } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { SETTING_FIELDS } from '@/lib/catalog/settings';
import { prisma } from '@/lib/prisma';

// Whole-number settings and the range each one makes sense in.
const NUMBER_LIMITS: Record<string, [number, number]> = {
  low_stock_threshold: [0, 1000],
  catalog_page_size: [1, 60],
  return_window_days: [0, 365],
  warranty_years_standard: [0, 20],
  warranty_years_smart: [0, 20],
  student_discount_pct: [0, 100],
};

export async function saveSettings(_previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, SETTING_FIELDS.map((field) => field.key));

  for (const field of SETTING_FIELDS) {
    const value = values[field.key].trim();
    if (field.kind === 'number') {
      const [min, max] = NUMBER_LIMITS[field.key] ?? [0, 1_000_000];
      if (!/^\d{1,7}$/.test(value) || Number(value) < min || Number(value) > max) {
        return { values, error: `${field.label} must be a whole number from ${min} to ${max.toLocaleString('en-US')}.` };
      }
    } else if (value.length > 300) {
      return { values, error: `${field.label} must be 300 characters or fewer.` };
    }
  }

  try {
    await prisma.$transaction(
      SETTING_FIELDS.map((field) => {
        const value = values[field.key].trim();
        return prisma.storeSetting.upsert({ where: { key: field.key }, update: { value }, create: { key: field.key, value } });
      }),
    );
  } catch (error) {
    console.error('saveSettings failed', error);
    return { values, error: 'We couldn’t save the settings. Please try again.' };
  }
  revalidatePath('/admin/settings');
  refreshCatalog();
  return { message: 'Settings saved. The shop uses them within a minute.' };
}

const shippingSchema = z
  .object({
    label: z.string().trim().min(1, 'Enter a name for this delivery option.').max(40, 'The name must be 40 characters or fewer.'),
    fee: z.string().trim().regex(/^\d{1,6}$/, 'The fee must be a whole number of pesos.').transform(Number),
    minDays: z.string().trim().regex(/^\d{1,2}$/, 'Days must be whole numbers.').transform(Number),
    maxDays: z.string().trim().regex(/^\d{1,2}$/, 'Days must be whole numbers.').transform(Number),
    isActive: z.boolean(),
  })
  .refine((data) => data.minDays <= data.maxDays, { message: 'The fastest delivery can’t be later than the slowest.' });

export async function saveShippingRate(method: 'STANDARD' | 'EXPRESS', _previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  if (method !== 'STANDARD' && method !== 'EXPRESS') return { error: 'Unknown delivery option.' };
  const values = formValues(formData, ['label', 'fee', 'minDays', 'maxDays'], ['isActive']);
  const parsed = shippingSchema.safeParse({ ...values, isActive: values.isActive === 'on' });
  if (!parsed.success) return { values, error: parsed.error.issues[0].message };

  try {
    await prisma.shippingRate.upsert({ where: { method }, update: parsed.data, create: { method, ...parsed.data } });
  } catch (error) {
    console.error('saveShippingRate failed', error);
    return { values, error: 'We couldn’t save this delivery option. Please try again.' };
  }
  revalidatePath('/admin/settings');
  refreshCatalog();
  return { message: 'Saved.' };
}
