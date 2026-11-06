'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { formValues, type ConfigFormState } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { prisma } from '@/lib/prisma';

const FILTER_KINDS = ['FRAME_MATERIAL', 'LENS_OPTION', 'FRAME_SHAPE', 'COLOR_FAMILY'] as const;

function refresh() {
  revalidatePath('/admin/options');
  revalidatePath('/admin/products');
  refreshCatalog();
}

const optionalNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d{1,7}$/.test(value) && Number(value) <= max), `${label} must be a whole number up to ${max.toLocaleString('en-US')}.`)
    .transform((value) => (value === '' ? null : Number(value)));

// ---- Filter lists (the choices in the shop filters and the product form) ----------------

const filterSchema = z.object({
  label: z.string().trim().min(1, 'Enter a label.').max(40, 'The label must be 40 characters or fewer.'),
  hex: z
    .string()
    .trim()
    .refine((value) => value === '' || /^#[0-9a-fA-F]{6}$/.test(value), 'Swatch colors look like #C0C6CF.')
    .transform((value) => (value ? value.toUpperCase() : null)),
  displayOrder: z.string().trim().regex(/^\d{1,4}$/, 'Display order must be a whole number.').transform(Number),
  isActive: z.boolean(),
});

const filterKeyFields = z.object({
  kind: z.enum(FILTER_KINDS),
  value: z.string().trim().min(1, 'Enter a value.').max(40, 'The value must be 40 characters or fewer.'),
});

export async function createFilterOption(_previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, ['kind', 'value', 'label', 'hex', 'displayOrder'], ['isActive']);
  const key = filterKeyFields.safeParse(values);
  const rest = filterSchema.safeParse({ ...values, isActive: values.isActive === 'on' });
  if (!key.success) return { values, error: key.error.issues[0].message };
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    if (await prisma.filterOption.findUnique({ where: { kind_value: key.data } })) {
      return { values, error: 'That value already exists in this list.' };
    }
    await prisma.filterOption.create({ data: { ...key.data, ...rest.data } });
  } catch (error) {
    console.error('createFilterOption failed', error);
    return { values, error: 'We couldn’t save this option. Please try again.' };
  }
  refresh();
  return { message: 'Added.' };
}

export async function updateFilterOption(kind: string, value: string, _previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const key = filterKeyFields.safeParse({ kind, value });
  if (!key.success) return { error: 'Unknown option.' };
  const values = formValues(formData, ['label', 'hex', 'displayOrder'], ['isActive']);
  const rest = filterSchema.safeParse({ ...values, isActive: values.isActive === 'on' });
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    const { count } = await prisma.filterOption.updateMany({ where: key.data, data: rest.data });
    if (count === 0) return { values, error: 'This option no longer exists. Refresh the page.' };
  } catch (error) {
    console.error('updateFilterOption failed', error);
    return { values, error: 'We couldn’t save this option. Please try again.' };
  }
  refresh();
  return { message: 'Saved.' };
}

// Products keep the text they already have; the value just stops being offered.
export async function deleteFilterOption(kind: string, value: string) {
  await requireAdmin();
  const key = filterKeyFields.safeParse({ kind, value });
  if (!key.success) return;
  await prisma.filterOption.deleteMany({ where: key.data });
  refresh();
}

// ---- Frame material details ---------------------------------------------------------------

const materialSchema = z.object({
  dimensions: z.string().trim().max(120, 'Dimensions must be 120 characters or fewer.'),
  weight: z.string().trim().max(60, 'Weight must be 60 characters or fewer.'),
  composition: z.string().trim().max(200, 'Composition must be 200 characters or fewer.'),
  performance: z.string().trim().max(500, 'Performance notes must be 500 characters or fewer.'),
  nosePad: z.string().trim().max(60, 'Nose pad must be 60 characters or fewer.'),
  isHypoallergenic: z.boolean(),
  isActive: z.boolean(),
});
const MATERIAL_TEXT = ['dimensions', 'weight', 'composition', 'performance', 'nosePad'] as const;
const MATERIAL_CHECKS = ['isHypoallergenic', 'isActive'] as const;
const nameField = z.string().trim().min(1, 'Enter a name.').max(40, 'The name must be 40 characters or fewer.');

export async function createFrameMaterial(_previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, ['material', ...MATERIAL_TEXT], MATERIAL_CHECKS);
  const name = nameField.safeParse(values.material);
  const rest = materialSchema.safeParse({ ...values, isHypoallergenic: values.isHypoallergenic === 'on', isActive: values.isActive === 'on' });
  if (!name.success) return { values, error: name.error.issues[0].message };
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    if (await prisma.frameMaterialInfo.findUnique({ where: { material: name.data } })) return { values, error: 'That material already exists.' };
    await prisma.frameMaterialInfo.create({ data: { material: name.data, ...rest.data } });
  } catch (error) {
    console.error('createFrameMaterial failed', error);
    return { values, error: 'We couldn’t save this material. Please try again.' };
  }
  refresh();
  return { message: 'Added.' };
}

export async function updateFrameMaterial(material: string, _previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, MATERIAL_TEXT, MATERIAL_CHECKS);
  const rest = materialSchema.safeParse({ ...values, isHypoallergenic: values.isHypoallergenic === 'on', isActive: values.isActive === 'on' });
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    const { count } = await prisma.frameMaterialInfo.updateMany({ where: { material }, data: rest.data });
    if (count === 0) return { values, error: 'This material no longer exists. Refresh the page.' };
  } catch (error) {
    console.error('updateFrameMaterial failed', error);
    return { values, error: 'We couldn’t save this material. Please try again.' };
  }
  refresh();
  return { message: 'Saved.' };
}

export async function deleteFrameMaterial(material: string) {
  await requireAdmin();
  await prisma.frameMaterialInfo.deleteMany({ where: { material } });
  refresh();
}

// ---- Lens option details ------------------------------------------------------------------

const lensSchema = z
  .object({
    description: z.string().trim().max(800, 'The description must be 800 characters or fewer.'),
    metric: z.string().trim().max(120, 'The performance metric must be 120 characters or fewer.').transform((value) => value || null),
    upgradeMinPrice: optionalNumber('The upgrade price', 1_000_000),
    upgradeMaxPrice: optionalNumber('The upgrade price', 1_000_000),
    isActive: z.boolean(),
  })
  .refine((data) => data.upgradeMinPrice === null || data.upgradeMaxPrice === null || data.upgradeMinPrice <= data.upgradeMaxPrice, {
    message: 'The lowest upgrade price can’t be higher than the highest.',
  });
const LENS_TEXT = ['description', 'metric', 'upgradeMinPrice', 'upgradeMaxPrice'] as const;

export async function createLensOption(_previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, ['lensOption', ...LENS_TEXT], ['isActive']);
  const name = nameField.safeParse(values.lensOption);
  const rest = lensSchema.safeParse({ ...values, isActive: values.isActive === 'on' });
  if (!name.success) return { values, error: name.error.issues[0].message };
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    if (await prisma.lensOptionInfo.findUnique({ where: { lensOption: name.data } })) return { values, error: 'That lens option already exists.' };
    await prisma.lensOptionInfo.create({ data: { lensOption: name.data, ...rest.data } });
  } catch (error) {
    console.error('createLensOption failed', error);
    return { values, error: 'We couldn’t save this lens option. Please try again.' };
  }
  refresh();
  return { message: 'Added.' };
}

export async function updateLensOption(lensOption: string, _previous: ConfigFormState, formData: FormData): Promise<ConfigFormState> {
  await requireAdmin();
  const values = formValues(formData, LENS_TEXT, ['isActive']);
  const rest = lensSchema.safeParse({ ...values, isActive: values.isActive === 'on' });
  if (!rest.success) return { values, error: rest.error.issues[0].message };
  try {
    const { count } = await prisma.lensOptionInfo.updateMany({ where: { lensOption }, data: rest.data });
    if (count === 0) return { values, error: 'This lens option no longer exists. Refresh the page.' };
  } catch (error) {
    console.error('updateLensOption failed', error);
    return { values, error: 'We couldn’t save this lens option. Please try again.' };
  }
  refresh();
  return { message: 'Saved.' };
}

export async function deleteLensOption(lensOption: string) {
  await requireAdmin();
  await prisma.lensOptionInfo.deleteMany({ where: { lensOption } });
  refresh();
}
