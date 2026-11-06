'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { formValues, type ConfigFormState } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { prisma } from '@/lib/prisma';

const offerSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name for the offer.').max(80, 'The name must be 80 characters or fewer.'),
    description: z.string().trim().max(300, 'The description must be 300 characters or fewer.'),
    badge: z.string().trim().min(1, 'Enter a badge label, such as “5% Off”.').max(30, 'The badge label must be 30 characters or fewer.'),
    kind: z.enum(['PERCENT', 'FIXED_AMOUNT']),
    value: z.string().trim().regex(/^\d{1,7}$/, 'The value must be a whole number.').transform(Number),
    eligibility: z.enum(['NONE', 'STUDENT_ID', 'FIRST_ORDER']),
    requiresCode: z.boolean(),
    isActive: z.boolean(),
    // The offer runs through the end of this day (Manila time).
    endsAt: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use a date for the end of the offer.')
      .transform((value) => (value ? new Date(`${value}T23:59:59+08:00`) : null)),
  })
  .refine((data) => data.kind !== 'PERCENT' || data.value <= 100, { message: 'A percentage can’t be more than 100.', path: ['value'] });

const TEXT_KEYS = ['name', 'description', 'badge', 'kind', 'value', 'eligibility', 'endsAt'] as const;
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
  } catch (error) {
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
  } catch (error) {
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
