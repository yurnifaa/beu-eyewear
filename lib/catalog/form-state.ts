// Shape returned by the admin product actions and read by useActionState.
// `values` echoes the submitted text so a failed save doesn't wipe the form
// (file inputs can't be echoed, so the photo has to be picked again).
export interface ProductFormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
}

export const PRODUCT_FORM_FIELDS = [
  'slug',
  'name',
  'description',
  'price',
  'stockQuantity',
  'warrantyYears',
  'categorySlug',
  'subcategorySlug',
  'frameMaterial',
  'lensOption',
  'frameShape',
  'colors',
] as const;
