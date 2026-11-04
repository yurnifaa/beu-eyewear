import { z } from 'zod';
import { isAllowedImageUrl } from '@/lib/storage/image-rules';
import { SLUG_PATTERN } from '@/lib/validation/product';

export interface CategoryFormState {
  values?: Record<string, string>;
  error?: string;
  message?: string;
}

export const categoryFields = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(120, 'Name must be 120 characters or fewer.'),
  slug: z.string().trim().min(1, 'Enter a slug.').max(80, 'Slug must be 80 characters or fewer.')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens for the slug.'),
});

const displayOrder = z.string().trim().regex(/^\d{1,4}$/, 'Display order must be a whole number from 0 to 9999.').transform(Number);

export const categorySchema = categoryFields.extend({
  description: z.string().trim().max(2000, 'Description must be 2,000 characters or fewer.'),
  // A path under public/ (such as /categories/premium.jpg) or an uploaded image address.
  imageUrl: z.string().trim().max(500, 'Image address is too long.')
    .refine((value) => value === '' || isAllowedImageUrl(value), 'Use a path such as /categories/premium.jpg or an image address uploaded to the store.')
    .transform((value) => value || null),
  displayOrder,
  isActive: z.boolean(),
});

export const subcategorySchema = categoryFields.extend({
  categorySlug: categoryFields.shape.slug,
  description: z.string().trim().max(2000, 'Description must be 2,000 characters or fewer.').transform((value) => value || null),
  displayOrder,
  isActive: z.boolean(),
});
