// Shape returned by the admin product actions and read by useActionState.
// `values` echoes the submitted text so a failed save doesn't wipe the form
// (file inputs can't be echoed, so photos have to be picked again).
export interface ProductFormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
}

// Plain text fields read straight from the form. Checkboxes, the colors/SKUs editor and
// the bundle editor are handled separately in the action.
export const PRODUCT_TEXT_FIELDS = [
  'slug',
  'name',
  'shortDescription',
  'description',
  'productType',
  'categorySlug',
  'subcategorySlug',
  'frameMaterial',
  'lensOption',
  'frameShape',
  'lensSummary',
  'nosePadType',
  'lensWidthMm',
  'bridgeWidthMm',
  'templeLengthMm',
  'weightG',
  'compatibleWith',
  'features',
  'tags',
  'listPrice',
  'salePrice',
  'featuredRank',
  'warrantyYears',
  'returnWindowDays',
  'sortOrder',
  'status',
] as const;

export const PRODUCT_CHECKBOX_FIELDS = ['hasEyewearKit', 'isFeatured', 'isNewArrival'] as const;
