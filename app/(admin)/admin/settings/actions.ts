'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { formValues, type ConfigFormState } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { SETTING_FIELDS } from '@/lib/catalog/settings';
import { prisma } from '@/lib/prisma';
import { NO_MARKUP_MESSAGE, noMarkup } from '@/lib/validation/clean-text';

// Whole-number settings and the range each one makes sense in.
const NUMBER_LIMITS: Record<string, [number, number]> = {
  low_stock_threshold: [0, 1000],
  catalog_page_size: [1, 60],
  return_window_days: [0, 365],
  warranty_years_standard: [0, 20],
  warranty_years_smart: [0, 20],
  student_discount_pct: [0, 100],
};

// What a text setting may hold. Blank is always fine (the shop falls back to its defaults). The
// contact details have a shape, so a mistyped value can't end up as the target of a link
// (`javascript:` and friends) if a page ever shows one as a link.
function textSettingProblem(key: string, label: string, value: string): string | null {
  if (value.length > 300) return `${label} must be 300 characters or fewer.`;
  if (!noMarkup(value)) return `${label}: ${NO_MARKUP_MESSAGE.toLowerCase()}.`;
  if (value === '') return null;

  if (key === 'support_email' && !z.email().safeParse(value).success) {
    return `${label} must be a valid email address, such as help@beu.com.`;
  }
  if (key === 'website') {
    const isHttps = z.url({ protocol: /^https$/, hostname: z.regexes.domain }).safeParse(value).success;
    if (!isHttps) return `${label} must be a full web address starting with https://, such as https://beu.com.`;
  }
  if (key === 'social_handle' && !/^@?[A-Za-z0-9._]{1,50}$/.test(value)) {
    return `${label} can only use letters, numbers, dots and underscores, such as @beueyewear.`;
  }
  return null;
}

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
    } else {
      const problem = textSettingProblem(field.key, field.label, value);
      if (problem) return { values, error: problem };
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
    label: z.string().trim().min(1, 'Enter a name for this delivery option.').max(40, 'The name must be 40 characters or fewer.').refine(noMarkup, NO_MARKUP_MESSAGE),
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
