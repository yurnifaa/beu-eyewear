'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { PRODUCT_CHECKBOX_FIELDS, PRODUCT_TEXT_FIELDS, type ProductFormState } from '@/lib/catalog/form-state';
import { prisma } from '@/lib/prisma';
import { deleteProductImage } from '@/lib/storage/product-image';
import { bundleItemSchema, createProductSchema, variantSchema } from '@/lib/validation/product';

// Products are edited in the admin app; the storefront caches its catalog reads for a minute, so
// refreshCatalog() lets it pick the change up straight away.
function revalidateAdmin() {
  for (const path of ['/admin', '/admin/products', '/admin/inventory']) revalidatePath(path);
  refreshCatalog();
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
}

// Everything both create and update check before touching the database.
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
    prepared: { values, data, variants, bundleItems: data.productType === 'BUNDLE' ? bundleRows.data : [] },
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
  const { values, data, variants, bundleItems } = result.prepared;

  if (await prisma.product.findUnique({ where: { slug: data.slug }, select: { slug: true } })) {
    return { values, fieldErrors: { slug: ['A product with this slug already exists'] } };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.create({
        data: {
          ...productData(data),
          slug: data.slug,
          // Photos live on the colors; these old product-level columns stay empty.
          galleryUrls: [],
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
  const { values, data, variants, bundleItems } = result.prepared;

  const existingBySku = new Map(existing.variants.map((variant) => [variant.sku, variant]));
  const submitted = new Set(variants.map((variant) => variant.sku));
  const removed = existing.variants.filter((variant) => !submitted.has(variant.sku));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { slug },
        // Photos live on the colors now, so any old product-level photos are cleared here.
        data: { ...productData(data), imageUrl: null, galleryUrls: [] },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { values, fieldErrors: { variants: ['One of these SKUs or colors is already in use.'] } };
    }
    console.error('updateProduct failed', error);
    return { values, error: 'We couldn’t save your changes. Please try again.' };
  }

  // Only now that the rows point at the new photos is it safe to drop the old ones: photos taken off a
  // color, photos of colors that were removed, and any old product-level photos no color kept.
  const before = new Set([
    ...(existing.imageUrl ? [existing.imageUrl] : []),
    ...existing.galleryUrls,
    ...existing.variants.flatMap((variant) => variant.imageUrls),
  ]);
  const after = new Set(variants.flatMap((variant) => variant.imageUrls));
  await Promise.all([...before].filter((url) => !after.has(url)).map(deleteProductImage));

  revalidateAdmin();
  redirect('/admin/products');
}

export async function deleteProduct(slug: string) {
  const admin = await requireAdmin();

  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { imageUrl: true, galleryUrls: true, variants: { select: { sku: true, stockQuantity: true, imageUrls: true } } },
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
    await Promise.all(
      [existing.imageUrl, ...existing.galleryUrls, ...existing.variants.flatMap((variant) => variant.imageUrls)].map(deleteProductImage),
    );
  }

  revalidateAdmin();
  redirect('/admin/products');
}
