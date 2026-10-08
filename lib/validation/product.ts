import { z } from 'zod';
import { FRAME_MATERIALS, FRAME_SHAPES, LENS_OPTIONS } from '@/lib/catalog/enums';

const wholeNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${label} must be a whole number, 0 or more`)
    .transform(Number)
    .pipe(z.number().max(max, `${label} must be ${max.toLocaleString('en-US')} or less`));

// A blank select means "not applicable" and is stored as null.
const optionalChoice = (label: string, choices: readonly string[]) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || choices.includes(value), `Choose a valid ${label}`)
    .transform((value) => value || undefined);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Enter a product name').max(120, 'Name must be 120 characters or fewer'),
  description: z.string().trim().min(1, 'Enter a description').max(2000, 'Description must be 2,000 characters or fewer'),
  price: wholeNumber('Price', 10_000_000),
  stockQuantity: wholeNumber('Stock', 100_000),
  warrantyYears: wholeNumber('Warranty', 20),
  categorySlug: z.string().trim().min(1, 'Choose a category'),
  subcategorySlug: z.string().trim().min(1, 'Choose a subcategory'),
  frameMaterial: optionalChoice('frame material', FRAME_MATERIALS),
  lensOption: optionalChoice('lens option', LENS_OPTIONS),
  frameShape: optionalChoice('frame shape', FRAME_SHAPES),
  colors: z
    .string()
    .transform((value) =>
      [...new Set(value.split(',').map((color) => color.trim()).filter(Boolean))],
    )
    .pipe(z.array(z.string().max(40, 'Each color must be 40 characters or fewer')).max(20, 'Add at most 20 colors')),
});

export const createProductSchema = productFieldsSchema.extend({
  slug: z
    .string()
    .trim()
    .min(1, 'Enter a slug')
    .max(80, 'Slug must be 80 characters or fewer')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens, e.g. aria-aviator'),
});
