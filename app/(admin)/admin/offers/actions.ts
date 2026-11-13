'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { formValues, type ConfigFormState } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { prisma } from '@/lib/prisma';
import { NO_MARKUP_MESSAGE, noMarkup } from '@/lib/validation/clean-text';

// A blank or non-numeric entry means "no limit" (null), as before. A number above `max` is an error
// here, instead of overflowing the database integer and failing the save with a generic message.
const optionalWholeNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => !/^\d+$/.test(value) || Number(value) <= max, `${label} must be ${max.toLocaleString('en-US')} or less.`)
    .transform((value) => (value && /^\d+$/.test(value) ? Number(value) : null))
    .nullable();

const offerSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name for the offer.').max(80, 'The name must be 80 characters or fewer.').refine(noMarkup, NO_MARKUP_MESSAGE),
    description: z.string().trim().max(300, 'The description must be 300 characters or fewer.').refine(noMarkup, NO_MARKUP_MESSAGE),
    badge: z
      .string()
      .trim()
      .min(1, 'Enter a badge label, such as “5% Off”.')
      .max(30, 'The badge label must be 30 characters or fewer.')
      .refine(noMarkup, NO_MARKUP_MESSAGE),
    kind: z.enum(['PERCENT', 'FIXED_AMOUNT']),
    value: z.string().trim().regex(/^\d{1,7}$/, 'The value must be a whole number.').transform(Number),
    eligibility: z.enum(['NONE', 'FIRST_ORDER']),
    requiresCode: z.boolean(),
    isActive: z.boolean(),
    endsAt: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use a date for the end of the offer.')
      .transform((value) => (value ? new Date(`${value}T23:59:59+08:00`) : null)),
    code: z.string().trim().toUpperCase().max(50).refine(noMarkup, NO_MARKUP_MESSAGE).transform((v) => v || null).nullable(),
    maxRedemptions: optionalWholeNumber('The redemption limit', 1_000_000),
    termsAndConditions: z.string().trim().max(2000).refine(noMarkup, NO_MARKUP_MESSAGE),
    minOrderAmount: optionalWholeNumber('The minimum order amount', 10_000_000),
  })
  .refine((data) => data.kind !== 'PERCENT' || data.value <= 100, { message: 'A percentage can’t be more than 100.', path: ['value'] });

const TEXT_KEYS = ['name', 'description', 'badge', 'kind', 'value', 'eligibility', 'endsAt', 'code', 'maxRedemptions', 'termsAndConditions', 'minOrderAmount'] as const;
const CHECKBOX_KEYS = ['requiresCode', 'isActive'] as const;

function parse(formData: FormData) {
  const values = formValues(formData, TEXT_KEYS, CHECKBOX_KEYS);
  const parsed = offerSchema.safeParse({ ...values, requiresCode: values.requiresCode === 'on', isActive: values.isActive === 'on' });
  return { values, parsed };
}

function refresh() {
  revalidatePath('/admin/offers');
  refreshCatalog();
}

export async function createOffer(_previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const { values, parsed } = parse(formData);
  if (!parsed.success) return { values, error: parsed.error.issues[0].message };
  try {
    await prisma.offer.create({ data: parsed.data });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { values, error: 'This promo code is already in use.' };
    }
    console.error('createOffer failed', error);
    return { values, error: 'We couldn’t save this offer. Please try again.' };
  }
  refresh();
  return { message: 'Offer added.' };
}

export async function updateOffer(id: string, _previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const { values, parsed } = parse(formData);
  if (!parsed.success) return { values, error: parsed.error.issues[0].message };
  try {
    const { count } = await prisma.offer.updateMany({ where: { id }, data: parsed.data });
    if (count === 0) return { values, error: 'This offer no longer exists. Refresh the page.' };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { values, error: 'This promo code is already in use.' };
    }
    console.error('updateOffer failed', error);
    return { values, error: 'We couldn’t save this offer. Please try again.' };
  }
  refresh();
  return { message: 'Saved.' };
}

export async function deleteOffer(id: string) {
  await requireAdmin();
  await prisma.offer.deleteMany({ where: { id } });
  refresh();
}
