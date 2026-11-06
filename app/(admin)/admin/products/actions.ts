'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { MAX_GALLERY_IMAGES } from '@/lib/admin/product-form';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { PRODUCT_CHECKBOX_FIELDS, PRODUCT_TEXT_FIELDS, type ProductFormState } from '@/lib/catalog/form-state';
import { prisma } from '@/lib/prisma';
import { uploadTotalError } from '@/lib/storage/image-rules';
import {
  BlobNotConfiguredError,
  deleteProductImage,
  uploadProductImage,
  validateImageFile,
} from '@/lib/storage/product-image';
import { bundleItemSchema, createProductSchema, variantSchema } from '@/lib/validation/product';

// Products are edited in the admin app; the storefront caches its catalog reads for a minute, so
// refreshCatalog() lets it pick the change up straight away.
function revalidateAdmin() {
  for (const path of ['/admin', '/admin/products', '/admin/inventory']) revalidatePath(path);
  refreshCatalog();
}

function uploadErrorMessage(error: unknown) {
  return error instanceof BlobNotConfiguredError
    ? 'Photo uploads aren’t set up yet: BLOB_READ_WRITE_TOKEN is missing from .env.'
    : 'We couldn’t upload the photos. Please try again.';
}

// What the form sent, as text, so a failed save can put it all back.
function readValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of PRODUCT_TEXT_FIELDS) values[key] = String(formData.get(key) ?? '');
  for (const key of PRODUCT_CHECKBOX_FIELDS) values[key] = formData.get(key) === 'on' ? 'on' : '';
  values.variants = String(formData.get('variants') ?? '[]');
  values.bundleItems = String(formData.get('bundleItems') ?? '[]');
  return values;
}

function files(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function parseRows<T extends z.ZodType>(raw: string, schema: T, label: string): { data: z.infer<T>[] } | { error: string } {
  let json: unknown;
  try {
    json = JSON.parse(raw || '[]');
  } catch {
    return { error: `We couldn’t read the ${label}. Please reload the page and try again.` };
  }
  const result = z.array(schema).max(40, `Add at most 40 ${label}.`).safeParse(json);
  return result.success ? { data: result.data } : { error: result.error.issues[0]?.message ?? `Check the ${label}.` };
}

interface Prepared {
  values: Record<string, string>;
  data: z.infer<typeof createProductSchema>;
  variants: z.infer<typeof variantSchema>[];
  bundleItems: z.infer<typeof bundleItemSchema>[];
  primary: File | null;
  gallery: File[];
}

// Everything both create and update check before touching the database or Blob.
async function prepare(
  formData: FormData,
  existing: { slug: string } | null,
): Promise<{ ok: true; prepared: Prepared } | { ok: false; state: ProductFormState }> {
  const values = readValues(formData);
  if (existing) values.slug = existing.slug;
  const fail = (fieldErrors: NonNullable<ProductFormState['fieldErrors']>, error?: string) =>
    ({ ok: false, state: { values, fieldErrors, error } }) as const;

  const input = { ...values, ...Object.fromEntries(PRODUCT_CHECKBOX_FIELDS.map((key) => [key, values[key] === 'on'])) };
  const parsed = createProductSchema.safeParse(input);
  const fieldErrors: NonNullable<ProductFormState['fieldErrors']> = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;

  const variantRows = parseRows(values.variants, variantSchema, 'colors');
  const bundleRows = parseRows(values.bundleItems, bundleItemSchema, 'bundle items');
  if ('error' in variantRows) fieldErrors.variants = [variantRows.error];
  if ('error' in bundleRows) fieldErrors.bundleItems = [bundleRows.error];

  const primary = files(formData, 'image')[0] ?? null;
  const gallery = files(formData, 'gallery');
  for (const file of [primary, ...gallery]) {
    const problem = file && validateImageFile(file);
    if (problem) fieldErrors[file === primary ? 'image' : 'gallery'] = [problem];
  }
  const totalProblem = uploadTotalError([...(primary ? [primary] : []), ...gallery]);
  if (totalProblem && !fieldErrors.gallery) fieldErrors.gallery = [totalProblem];

  if (!parsed.success || 'error' in variantRows || 'error' in bundleRows || Object.keys(fieldErrors).length > 0) {
    return fail(fieldErrors);
  }

  const data = parsed.data;
  let variants = variantRows.data;

  if (data.status === 'ACTIVE' && variants.length === 0) {
    return fail({ variants: ['Add at least one color or option so the product can be bought, or save it as a draft.'] });
  }
  const skus = variants.map((variant) => variant.sku.toLowerCase());
  if (new Set(skus).size !== skus.length) return fail({ variants: ['Every color needs its own SKU. Two rows share one.'] });
  const colors = variants.map((variant) => variant.color.toLowerCase());
  if (new Set(colors).size !== colors.length) return fail({ variants: ['Each color name can be used once on a product.'] });
  // Exactly one default: the first one flagged, or else the first row.
  const defaultIndex = Math.max(0, variants.findIndex((variant) => variant.isDefault));
  variants = variants.map((variant, index) => ({ ...variant, isDefault: index === defaultIndex }));

  const subcategory = await prisma.subcategory.findUnique({ where: { slug: data.subcategorySlug }, select: { categorySlug: true } });
  if (!subcategory) return fail({ subcategorySlug: ['Choose a valid subcategory'] });
  if (subcategory.categorySlug !== data.categorySlug) {
    return fail({ subcategorySlug: ['That subcategory doesn’t belong to the chosen category'] });
  }

  // Material, lens and shape come from the managed lists.
  const chosen = [
    ['FRAME_MATERIAL', 'frameMaterial', data.frameMaterial],
    ['LENS_OPTION', 'lensOption', data.lensOption],
    ['FRAME_SHAPE', 'frameShape', data.frameShape],
  ] as const;
  for (const [kind, field, value] of chosen) {
    if (value && !(await prisma.filterOption.findUnique({ where: { kind_value: { kind, value } }, select: { value: true } }))) {
      return fail({ [field]: ['Choose one of the listed options'] });
    }
  }

  const taken = await prisma.productVariant.findMany({
    where: { sku: { in: variants.map((variant) => variant.sku) }, NOT: { productSlug: data.slug } },
    select: { sku: true },
  });
  if (taken.length > 0) return fail({ variants: [`SKU ${taken[0].sku} is already used by another product.`] });

  return {
    ok: true,
    prepared: { values, data, variants, bundleItems: data.productType === 'BUNDLE' ? bundleRows.data : [], primary, gallery },
  };
}

// The slug stays out of the update: it is the product's URL and primary key.
function productData(data: Prepared['data']) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- left out on purpose
  const { slug, ...rest } = data;
  return rest;
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const result = await prepare(formData, null);
  if (!result.ok) return result.state;
  const { values, data, variants, bundleItems, primary, gallery } = result.prepared;

  if (await prisma.product.findUnique({ where: { slug: data.slug }, select: { slug: true } })) {
    return { values, fieldErrors: { slug: ['A product with this slug already exists'] } };
  }

  const uploaded: string[] = [];
  let imageUrl: string | null = null;
  try {
    if (primary) {
      imageUrl = await uploadProductImage(data.slug, primary);
      uploaded.push(imageUrl);
    }
    for (const file of gallery.slice(0, MAX_GALLERY_IMAGES)) uploaded.push(await uploadProductImage(data.slug, file));
  } catch (error) {
    console.error('uploading product images failed', error);
    await Promise.all(uploaded.map(deleteProductImage));
    return { values, error: uploadErrorMessage(error) };
  }
  const galleryUrls = imageUrl ? uploaded.slice(1) : uploaded;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.create({
        data: {
          ...productData(data),
          slug: data.slug,
          imageUrl,
          galleryUrls,
          variants: {
            create: variants.map(({ stock, ...variant }, index) => ({ ...variant, sortOrder: index, stockQuantity: stock })),
          },
          bundleItems: { create: bundleItems.map((item, index) => ({ ...item, sortOrder: index })) },
        },
      });
      const opening = variants.filter((variant) => variant.stock > 0);
      if (opening.length > 0) {
        await tx.stockMovement.createMany({
          data: opening.map((variant) => ({
            sku: variant.sku,
            type: 'RECEIVE' as const,
            quantityChange: variant.stock,
            stockAfter: variant.stock,
            reason: 'Opening stock',
            actorId: admin.id,
          })),
        });
      }
    });
  } catch (error) {
    await Promise.all(uploaded.map(deleteProductImage));
    // The primary keys are the source of truth, so this also covers two admins racing.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { values, fieldErrors: { slug: ['A product with this slug or one of these SKUs already exists'] } };
    }
    console.error('createProduct failed', error);
    return { values, error: 'We couldn’t save this product. Please try again.' };
  }

  revalidateAdmin();
  redirect('/admin/products');
}

export async function updateProduct(
  slug: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
  if (!existing) return { values: readValues(formData), error: 'This product no longer exists.' };

  const result = await prepare(formData, existing);
  if (!result.ok) return result.state;
  const { values, data, variants, bundleItems, primary, gallery } = result.prepared;

  // Photos: a new file replaces the old one; "remove" drops it; otherwise keep what is there.
  const removeGallery = new Set(formData.getAll('removeGallery').map(String));
  const keptGallery = existing.galleryUrls.filter((url) => !removeGallery.has(url));
  if (keptGallery.length + gallery.length > MAX_GALLERY_IMAGES) {
    return { values, fieldErrors: { gallery: [`A product can have at most ${MAX_GALLERY_IMAGES} gallery photos.`] } };
  }

  const uploaded: string[] = [];
  let newPrimary: string | null = null;
  try {
    if (primary) {
      newPrimary = await uploadProductImage(slug, primary);
      uploaded.push(newPrimary);
    }
    for (const file of gallery) uploaded.push(await uploadProductImage(slug, file));
  } catch (error) {
    console.error('uploading product images failed', error);
    await Promise.all(uploaded.map(deleteProductImage));
    return { values, error: uploadErrorMessage(error) };
  }
  const imageUrl = newPrimary ?? (formData.get('removeImage') === 'on' ? null : existing.imageUrl);
  const galleryUrls = [...keptGallery, ...(newPrimary ? uploaded.slice(1) : uploaded)];

  const existingBySku = new Map(existing.variants.map((variant) => [variant.sku, variant]));
  const submitted = new Set(variants.map((variant) => variant.sku));
  const removed = existing.variants.filter((variant) => !submitted.has(variant.sku));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { slug },
        data: { ...productData(data), imageUrl, galleryUrls },
      });

      // Colors that were taken out leave the shop; whatever stock they held is written off
      // in the history rather than silently vanishing.
      if (removed.length > 0) {
        await tx.productVariant.deleteMany({ where: { sku: { in: removed.map((variant) => variant.sku) } } });
        const written = removed.filter((variant) => variant.stockQuantity > 0);
        if (written.length > 0) {
          await tx.stockMovement.createMany({
            data: written.map((variant) => ({
              sku: variant.sku,
              type: 'ADJUSTMENT' as const,
              quantityChange: -variant.stockQuantity,
              stockAfter: 0,
              reason: 'Color removed from product',
              actorId: admin.id,
            })),
          });
        }
      }

      // Park renamed colors first so two colors swapping names can't collide mid-way.
      for (const variant of variants) {
        const before = existingBySku.get(variant.sku);
        if (before && before.color !== variant.color) {
          await tx.productVariant.update({ where: { sku: variant.sku }, data: { color: `~${variant.sku}` } });
        }
      }
      const created: typeof variants = [];
      for (const [index, { stock, ...variant }] of variants.entries()) {
        if (existingBySku.has(variant.sku)) {
          // Stock is not touched here: it changes through Inventory, which records why.
          await tx.productVariant.update({ where: { sku: variant.sku }, data: { ...variant, sortOrder: index } });
        } else {
          await tx.productVariant.create({ data: { ...variant, productSlug: slug, sortOrder: index, stockQuantity: stock } });
          if (stock > 0) created.push({ ...variant, stock });
        }
      }
      if (created.length > 0) {
        await tx.stockMovement.createMany({
          data: created.map((variant) => ({
            sku: variant.sku,
            type: 'RECEIVE' as const,
            quantityChange: variant.stock,
            stockAfter: variant.stock,
            reason: 'Opening stock',
            actorId: admin.id,
          })),
        });
      }

      await tx.bundleItem.deleteMany({ where: { bundleSlug: slug } });
      if (bundleItems.length > 0) {
        await tx.bundleItem.createMany({ data: bundleItems.map((item, index) => ({ ...item, bundleSlug: slug, sortOrder: index })) });
      }
    });
  } catch (error) {
    await Promise.all(uploaded.map(deleteProductImage));
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { values, fieldErrors: { variants: ['One of these SKUs or colors is already in use.'] } };
    }
    console.error('updateProduct failed', error);
    return { values, error: 'We couldn’t save your changes. Please try again.' };
  }

  // Only now that the row points at the new photos is it safe to drop the old ones.
  if (existing.imageUrl && existing.imageUrl !== imageUrl) await deleteProductImage(existing.imageUrl);
  await Promise.all(existing.galleryUrls.filter((url) => !galleryUrls.includes(url)).map(deleteProductImage));

  revalidateAdmin();
  redirect('/admin/products');
}

export async function deleteProduct(slug: string) {
  const admin = await requireAdmin();

  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { imageUrl: true, galleryUrls: true, variants: { select: { sku: true, stockQuantity: true } } },
  });
  if (existing) {
    // Order history keeps working: OrderItem snapshots the product and has no FK to it.
    // Colors, reviews and bundle items go with the product.
    await prisma.$transaction(async (tx) => {
      await tx.product.delete({ where: { slug } });
      const written = existing.variants.filter((variant) => variant.stockQuantity > 0);
      if (written.length > 0) {
        await tx.stockMovement.createMany({
          data: written.map((variant) => ({
            sku: variant.sku,
            type: 'ADJUSTMENT' as const,
            quantityChange: -variant.stockQuantity,
            stockAfter: 0,
            reason: 'Product deleted',
            actorId: admin.id,
          })),
        });
      }
    });
    await Promise.all([existing.imageUrl, ...existing.galleryUrls].map(deleteProductImage));
  }

  revalidateAdmin();
  redirect('/admin/products');
}
