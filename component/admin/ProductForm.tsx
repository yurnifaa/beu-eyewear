'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import {
  MAX_GALLERY_IMAGES,
  type BundleRow,
  type ProductFormDefaults,
  type ProductFormOptions,
  type VariantRow,
} from '@/lib/admin/product-form';
import type { ProductFormState } from '@/lib/catalog/form-state';
import { ACCEPTED_IMAGE_TYPES, imageFileError, uploadTotalError } from '@/lib/storage/image-rules';

// What the other photo input already holds, so the combined size can be checked.
const pickedFiles = (inputId: string) => Array.from((document.getElementById(inputId) as HTMLInputElement | null)?.files ?? []);
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from '@/lib/validation/product';

const fieldClassName = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';
const labelClassName = 'text-sm font-semibold';
const checkboxLabelClassName = 'flex items-center gap-2 text-sm';
const sectionClassName = 'flex flex-col gap-5 rounded-xl border border-border bg-background p-5';

const initialState: ProductFormState = {};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

const invalid = (id: string, error?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
});

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
      <Image src={src} alt={alt} fill sizes="80px" unoptimized className="object-cover" />
    </div>
  );
}

export interface ProductFormProps {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  options: ProductFormOptions;
  defaults: ProductFormDefaults;
  isEdit: boolean;
  submitLabel: string;
}

export default function ProductForm({ action, options, defaults, isEdit, submitLabel }: ProductFormProps) {
  const [pickedPrimary, setPickedPrimary] = useState<string | null>(null);
  const [pickedCount, setPickedCount] = useState(0);
  // Set when a chosen file is rejected in the browser, before any upload.
  const [fileProblem, setFileProblem] = useState<{ image?: string; gallery?: string }>({});
  const [state, formAction, pending] = useActionState(async (prevState: ProductFormState, formData: FormData) => {
    const next = await action(prevState, formData);
    // A failed save clears the file inputs, so drop the stale previews with them.
    setPickedPrimary(null);
    setPickedCount(0);
    setFileProblem({});
    return next;
  }, initialState);
  const errors = state.fieldErrors ?? {};
  const err = (key: string) => errors[key]?.[0];

  // After a failed save the action echoes what was typed; otherwise show the saved product.
  // The form resets its uncontrolled inputs after every action, so these must stay current.
  const text = (key: keyof ProductFormDefaults) => state.values?.[key] ?? String(defaults[key] ?? '');
  const checked = (key: 'isStudentEligible' | 'hasEyewearKit' | 'isFeatured' | 'isNewArrival') =>
    state.values ? state.values[key] === 'on' : defaults[key];

  const [slug, setSlug] = useState(defaults.slug);
  const [slugEdited, setSlugEdited] = useState(false);
  const [categorySlug, setCategorySlug] = useState(defaults.categorySlug);
  const [productType, setProductType] = useState(defaults.productType);
  const [removeImage, setRemoveImage] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>(defaults.variants);
  const [bundleItems, setBundleItems] = useState<BundleRow[]>(defaults.bundleItems);

  const subcategories = options.subcategories.filter((subcategory) => subcategory.categorySlug === categorySlug);
  const shownImage = pickedPrimary ?? (removeImage ? null : defaults.imageUrl);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    return () => {
      if (pickedPrimary) URL.revokeObjectURL(pickedPrimary);
    };
  }, [pickedPrimary]);

  const patchVariant = (index: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const setDefaultVariant = (index: number) => setVariants((rows) => rows.map((row, i) => ({ ...row, isDefault: i === index })));
  const patchBundle = (index: number, patch: Partial<BundleRow>) =>
    setBundleItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-6">
      <fieldset className={sectionClassName}>
        <legend className="px-2 text-sm font-bold uppercase tracking-wide">Basics</legend>

        <Field
          id="slug"
          label="Slug"
          error={err('slug')}
          hint={isEdit ? 'The slug is the product’s URL and can’t be changed.' : 'Used in the product’s URL. Filled in from the name; you can change it.'}
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            required
            readOnly={isEdit}
            {...invalid('slug', err('slug'))}
            className={`${fieldClassName} ${isEdit ? 'opacity-60' : ''}`}
          />
        </Field>

        <Field id="name" label="Name" error={err('name')}>
          <input
            id="name"
            name="name"
            defaultValue={text('name')}
            onChange={(event) => {
              if (!isEdit && !slugEdited) setSlug(slugify(event.target.value));
            }}
            required
            {...invalid('name', err('name'))}
            className={fieldClassName}
          />
        </Field>

        <Field id="shortDescription" label="Short description" error={err('shortDescription')} hint="One line shown on cards and the spotlight.">
          <input id="shortDescription" name="shortDescription" defaultValue={text('shortDescription')} maxLength={300} {...invalid('shortDescription', err('shortDescription'))} className={fieldClassName} />
        </Field>

        <Field id="description" label="Description" error={err('description')}>
          <textarea id="description" name="description" defaultValue={text('description')} rows={4} {...invalid('description', err('description'))} className={fieldClassName} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="productType" label="Type" error={err('productType')}>
            <select id="productType" name="productType" value={productType} onChange={(event) => setProductType(event.target.value)} className={fieldClassName}>
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PRODUCT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="status" label="Status" error={err('status')} hint="Only active products appear in the shop.">
            <select id="status" name="status" defaultValue={text('status')} className={fieldClassName}>
              {PRODUCT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PRODUCT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="sortOrder" label="Display order" error={err('sortOrder')} hint="Lowest first when no sort is chosen.">
            <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} defaultValue={text('sortOrder')} required {...invalid('sortOrder', err('sortOrder'))} className={fieldClassName} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="categorySlug" label="Category" error={err('categorySlug')}>
            <select id="categorySlug" name="categorySlug" value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)} required className={fieldClassName}>
              {options.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="subcategorySlug" label="Subcategory" error={err('subcategorySlug')}>
            {/* Keyed on the category so switching it re-picks a valid subcategory. */}
            <select
              key={categorySlug}
              id="subcategorySlug"
              name="subcategorySlug"
              defaultValue={categorySlug === defaults.categorySlug ? text('subcategorySlug') : undefined}
              required
              {...invalid('subcategorySlug', err('subcategorySlug'))}
              className={fieldClassName}
            >
              {subcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className={sectionClassName}>
        <legend className="px-2 text-sm font-bold uppercase tracking-wide">Pricing &amp; visibility</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field id="listPrice" label="Price (₱)" error={err('listPrice')}>
            <input id="listPrice" name="listPrice" type="number" min={1} step={1} defaultValue={text('listPrice')} required {...invalid('listPrice', err('listPrice'))} className={fieldClassName} />
          </Field>
          <Field id="salePrice" label="Sale price (₱)" error={err('salePrice')} hint="Optional. Must be lower than the price.">
            <input id="salePrice" name="salePrice" type="number" min={1} step={1} defaultValue={text('salePrice')} {...invalid('salePrice', err('salePrice'))} className={fieldClassName} />
          </Field>
          <Field id="warrantyYears" label="Warranty (years)" error={err('warrantyYears')}>
            <input id="warrantyYears" name="warrantyYears" type="number" min={0} step={1} defaultValue={text('warrantyYears')} required {...invalid('warrantyYears', err('warrantyYears'))} className={fieldClassName} />
          </Field>
          <Field id="returnWindowDays" label="Return window (days)" error={err('returnWindowDays')} hint="Blank uses the store setting.">
            <input id="returnWindowDays" name="returnWindowDays" type="number" min={0} step={1} defaultValue={text('returnWindowDays')} {...invalid('returnWindowDays', err('returnWindowDays'))} className={fieldClassName} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <label className={checkboxLabelClassName}>
            <input type="checkbox" name="isFeatured" defaultChecked={checked('isFeatured')} /> Featured on the home page
          </label>
          <Field id="featuredRank" label="Featured rank" error={err('featuredRank')} hint="1 is the big spotlight.">
            <input id="featuredRank" name="featuredRank" type="number" min={1} max={99} step={1} defaultValue={text('featuredRank')} {...invalid('featuredRank', err('featuredRank'))} className={fieldClassName} />
          </Field>
          <label className={checkboxLabelClassName}>
            <input type="checkbox" name="isNewArrival" defaultChecked={checked('isNewArrival')} /> New arrival
          </label>
          <label className={checkboxLabelClassName}>
            <input type="checkbox" name="isStudentEligible" defaultChecked={checked('isStudentEligible')} /> Student eligible
          </label>
          <label className={checkboxLabelClassName}>
            <input type="checkbox" name="hasEyewearKit" defaultChecked={checked('hasEyewearKit')} /> Includes free eyewear kit
          </label>
        </div>
      </fieldset>

      <fieldset className={sectionClassName}>
        <legend className="px-2 text-sm font-bold uppercase tracking-wide">Details</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="frameMaterial" label="Frame material" error={err('frameMaterial')}>
            <select id="frameMaterial" name="frameMaterial" defaultValue={text('frameMaterial')} className={fieldClassName}>
              <option value="">—</option>
              {options.materials.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field id="lensOption" label="Lens option" error={err('lensOption')}>
            <select id="lensOption" name="lensOption" defaultValue={text('lensOption')} className={fieldClassName}>
              <option value="">—</option>
              {options.lenses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field id="frameShape" label="Frame shape" error={err('frameShape')}>
            <select id="frameShape" name="frameShape" defaultValue={text('frameShape')} className={fieldClassName}>
              <option value="">—</option>
              {options.shapes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="lensSummary" label="Lens summary" error={err('lensSummary')}>
            <input id="lensSummary" name="lensSummary" defaultValue={text('lensSummary')} maxLength={200} {...invalid('lensSummary', err('lensSummary'))} className={fieldClassName} />
          </Field>
          <Field id="nosePadType" label="Nose pad type" error={err('nosePadType')}>
            <input id="nosePadType" name="nosePadType" defaultValue={text('nosePadType')} maxLength={60} {...invalid('nosePadType', err('nosePadType'))} className={fieldClassName} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field id="lensWidthMm" label="Lens width (mm)" error={err('lensWidthMm')}>
            <input id="lensWidthMm" name="lensWidthMm" type="number" min={0} step={1} defaultValue={text('lensWidthMm')} {...invalid('lensWidthMm', err('lensWidthMm'))} className={fieldClassName} />
          </Field>
          <Field id="bridgeWidthMm" label="Bridge (mm)" error={err('bridgeWidthMm')}>
            <input id="bridgeWidthMm" name="bridgeWidthMm" type="number" min={0} step={1} defaultValue={text('bridgeWidthMm')} {...invalid('bridgeWidthMm', err('bridgeWidthMm'))} className={fieldClassName} />
          </Field>
          <Field id="templeLengthMm" label="Temple (mm)" error={err('templeLengthMm')}>
            <input id="templeLengthMm" name="templeLengthMm" type="number" min={0} step={1} defaultValue={text('templeLengthMm')} {...invalid('templeLengthMm', err('templeLengthMm'))} className={fieldClassName} />
          </Field>
          <Field id="weightG" label="Weight (g)" error={err('weightG')}>
            <input id="weightG" name="weightG" type="number" min={0} step={1} defaultValue={text('weightG')} {...invalid('weightG', err('weightG'))} className={fieldClassName} />
          </Field>
        </div>
        <Field id="features" label="Feature highlights" error={err('features')} hint="One per line.">
          <textarea id="features" name="features" defaultValue={text('features')} rows={3} {...invalid('features', err('features'))} className={fieldClassName} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="tags" label="Tags" error={err('tags')} hint="Comma-separated. Used by search.">
            <input id="tags" name="tags" defaultValue={text('tags')} {...invalid('tags', err('tags'))} className={fieldClassName} />
          </Field>
          <Field id="compatibleWith" label="Compatible with" error={err('compatibleWith')} hint="Product slugs, comma-separated (for accessories).">
            <input id="compatibleWith" name="compatibleWith" defaultValue={text('compatibleWith')} {...invalid('compatibleWith', err('compatibleWith'))} className={fieldClassName} />
          </Field>
        </div>
      </fieldset>

      <fieldset className={sectionClassName}>
        <legend className="px-2 text-sm font-bold uppercase tracking-wide">Photos</legend>

        <div>
          <label className={labelClassName} htmlFor="image">
            Main photo
          </label>
          <div className="mt-1 flex items-start gap-4">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
              {shownImage ? (
                <Image src={shownImage} alt="Main photo preview" fill sizes="128px" unoptimized className="object-contain" />
              ) : (
                <span className="px-2 text-center text-xs text-muted-foreground">No photo</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                id="image"
                name="image"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  const problem = file ? (imageFileError(file) ?? uploadTotalError([file, ...pickedFiles('gallery')])) : null;
                  setFileProblem((current) => ({ ...current, image: problem ?? undefined }));
                  if (problem) {
                    // Don't submit a file the server would reject anyway.
                    event.target.value = '';
                    setPickedPrimary(null);
                    return;
                  }
                  setPickedPrimary(file ? URL.createObjectURL(file) : null);
                }}
                {...invalid('image', fileProblem.image ?? err('image'))}
                className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP or AVIF, up to 4 MB. A product shot on a plain white background works best.
                {isEdit && defaults.imageUrl ? ' Choosing a new file replaces the current photo.' : ''}
              </p>
              {isEdit && defaults.imageUrl && (
                <label className={checkboxLabelClassName}>
                  <input type="checkbox" name="removeImage" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} />
                  Remove current photo
                </label>
              )}
            </div>
          </div>
          {(fileProblem.image ?? err('image')) && (
            <p id="image-error" className="mt-1 text-xs text-red-500">
              {fileProblem.image ?? err('image')}
            </p>
          )}
        </div>

        <div>
          <label className={labelClassName} htmlFor="gallery">
            Gallery photos
          </label>
          {defaults.galleryUrls.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-3">
              {defaults.galleryUrls.map((url, index) => (
                <li key={url} className="flex flex-col items-start gap-1">
                  <Thumb src={url} alt={`Gallery photo ${index + 1}`} />
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" name="removeGallery" value={url} /> Remove
                  </label>
                </li>
              ))}
            </ul>
          )}
          <input
            id="gallery"
            name="gallery"
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? []);
              const problem = picked.map((file) => imageFileError(file)).find(Boolean) ?? uploadTotalError([...picked, ...pickedFiles('image')]);
              setFileProblem((current) => ({ ...current, gallery: problem ?? undefined }));
              if (problem) {
                event.target.value = '';
                setPickedCount(0);
                return;
              }
              setPickedCount(picked.length);
            }}
            {...invalid('gallery', fileProblem.gallery ?? err('gallery'))}
            className="mt-2 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-semibold"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Up to {MAX_GALLERY_IMAGES} photos in total, and the photos you add in one save must total 4 MB or less (save, then add more).{' '}
            {pickedCount > 0 ? `${pickedCount} new photo${pickedCount === 1 ? '' : 's'} will be added.` : ''}
          </p>
          {(fileProblem.gallery ?? err('gallery')) && (
            <p id="gallery-error" className="mt-1 text-xs text-red-500">
              {fileProblem.gallery ?? err('gallery')}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className={sectionClassName}>
        <legend className="px-2 text-sm font-bold uppercase tracking-wide">Colors &amp; stock</legend>
        <p className="text-xs text-muted-foreground">
          Each row is one sellable option with its own SKU and stock. Use <strong>Standard</strong> for items sold in a single
          option, such as a care kit. Stock for an existing SKU is changed from Inventory so the change is recorded.
        </p>
        <input type="hidden" name="variants" value={JSON.stringify(variants)} />

        <ul className="flex flex-col gap-3">
          {variants.map((variant, index) => {
            const swatch = /^#[0-9a-fA-F]{6}$/.test(variant.hex) ? variant.hex : '#cccccc';
            return (
              <li key={index} className="grid grid-cols-2 items-end gap-3 rounded-lg border border-border p-3 sm:grid-cols-6">
                <div className="col-span-2">
                  <label className="text-xs font-semibold" htmlFor={`sku-${index}`}>SKU</label>
                  <input id={`sku-${index}`} value={variant.sku} readOnly={!variant.isNew} onChange={(event) => patchVariant(index, { sku: event.target.value })} placeholder="BEU-CLS-HOR-MBK" className={`${fieldClassName} ${variant.isNew ? '' : 'opacity-60'}`} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold" htmlFor={`color-${index}`}>Color</label>
                  <input id={`color-${index}`} value={variant.color} onChange={(event) => patchVariant(index, { color: event.target.value })} placeholder="Matte Black" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-xs font-semibold" htmlFor={`family-${index}`}>Family</label>
                  <select id={`family-${index}`} value={variant.colorFamily} onChange={(event) => patchVariant(index, { colorFamily: event.target.value })} className={fieldClassName}>
                    <option value="">—</option>
                    {options.colorFamilies.map((family) => (
                      <option key={family.value} value={family.value}>
                        {family.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold" htmlFor={`hex-${index}`}>Swatch</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" aria-label="Pick swatch color" value={swatch} onChange={(event) => patchVariant(index, { hex: event.target.value.toUpperCase() })} className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-background p-0.5" />
                    <input id={`hex-${index}`} value={variant.hex} onChange={(event) => patchVariant(index, { hex: event.target.value })} placeholder="#C0C6CF" maxLength={7} className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold" htmlFor={`tint-${index}`}>Lens tint</label>
                  <input id={`tint-${index}`} value={variant.lensTint} onChange={(event) => patchVariant(index, { lensTint: event.target.value })} placeholder="Optional" className={fieldClassName} />
                </div>
                <div>
                  <label className="text-xs font-semibold" htmlFor={`stock-${index}`}>{variant.isNew ? 'Opening stock' : 'In stock'}</label>
                  {variant.isNew ? (
                    <input id={`stock-${index}`} type="number" min={0} step={1} value={variant.stock} onChange={(event) => patchVariant(index, { stock: Math.max(0, Math.floor(Number(event.target.value) || 0)) })} className={fieldClassName} />
                  ) : (
                    <p id={`stock-${index}`} className="mt-1 py-2 text-sm tabular-nums">{variant.stock.toLocaleString('en-PH')}</p>
                  )}
                </div>
                <label className={checkboxLabelClassName}>
                  <input type="radio" name="defaultVariant" checked={variant.isDefault} onChange={() => setDefaultVariant(index)} /> Default
                </label>
                <button
                  type="button"
                  onClick={() => setVariants((rows) => rows.filter((_, i) => i !== index))}
                  className={buttonClassName({ variant: 'secondary', size: 'sm', className: 'text-red-600' })}
                >
                  Remove
                </button>
              </li>
            );
          })}
          {variants.length === 0 && <li className="text-sm text-muted-foreground">No colors yet. A product needs at least one to be sold.</li>}
        </ul>
        {err('variants') && <p role="alert" className="text-sm text-red-500">{err('variants')}</p>}
        <div>
          <button
            type="button"
            onClick={() => setVariants((rows) => [...rows, { sku: '', color: rows.length === 0 ? 'Standard' : '', colorFamily: '', hex: '', lensTint: '', isDefault: rows.length === 0, stock: 0, isNew: true }])}
            className={buttonClassName({ variant: 'secondary', size: 'sm' })}
          >
            Add a color
          </button>
        </div>
      </fieldset>

      {productType === 'BUNDLE' && (
        <fieldset className={sectionClassName}>
          <legend className="px-2 text-sm font-bold uppercase tracking-wide">Bundle contents</legend>
          <p className="text-xs text-muted-foreground">What is in the box. Add a product slug to link an item to its page.</p>
          <input type="hidden" name="bundleItems" value={JSON.stringify(bundleItems)} />
          <ul className="flex flex-col gap-3">
            {bundleItems.map((item, index) => (
              <li key={index} className="grid grid-cols-6 items-end gap-3">
                <div className="col-span-3">
                  <label className="text-xs font-semibold" htmlFor={`bundle-name-${index}`}>Item</label>
                  <input id={`bundle-name-${index}`} value={item.name} onChange={(event) => patchBundle(index, { name: event.target.value })} className={fieldClassName} />
                </div>
                <div>
                  <label className="text-xs font-semibold" htmlFor={`bundle-qty-${index}`}>Qty</label>
                  <input id={`bundle-qty-${index}`} type="number" min={1} max={99} value={item.quantity} onChange={(event) => patchBundle(index, { quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)) })} className={fieldClassName} />
                </div>
                <div>
                  <label className="text-xs font-semibold" htmlFor={`bundle-slug-${index}`}>Product slug</label>
                  <input id={`bundle-slug-${index}`} value={item.componentSlug} onChange={(event) => patchBundle(index, { componentSlug: event.target.value })} placeholder="Optional" className={fieldClassName} />
                </div>
                <button type="button" onClick={() => setBundleItems((rows) => rows.filter((_, i) => i !== index))} className={buttonClassName({ variant: 'secondary', size: 'sm', className: 'text-red-600' })}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {err('bundleItems') && <p role="alert" className="text-sm text-red-500">{err('bundleItems')}</p>}
          <div>
            <button type="button" onClick={() => setBundleItems((rows) => [...rows, { name: '', quantity: 1, componentSlug: '' }])} className={buttonClassName({ variant: 'secondary', size: 'sm' })}>
              Add an item
            </button>
          </div>
        </fieldset>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-red-500">
        {state.error}
      </p>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href="/admin/products" className={buttonClassName({ variant: 'ghost' })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
