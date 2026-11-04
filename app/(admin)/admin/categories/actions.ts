'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { categoryFields, categorySchema, subcategorySchema, type CategoryFormState } from '@/lib/admin/categories';
import { prisma } from '@/lib/prisma';

// The storefront reads categories straight from the database, so only admin pages need refreshing.
function revalidateAdmin() {
  for (const path of ['/admin/categories', '/admin/products', '/admin/inventory', '/admin', '/admin/reports']) {
    revalidatePath(path);
  }
}

function databaseError(error: unknown): CategoryFormState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return { error: 'That slug is already in use. Choose another slug.' };
    if (error.code === 'P2003') return { error: 'Related records changed. Refresh and check the category, subcategories and products.' };
    if (error.code === 'P2025') return { error: 'This category or subcategory no longer exists. Refresh the page.' };
    if (error.code === 'P2034') return { error: 'Another admin changed this data. Please try again.' };
  }
  return { error: 'We couldn’t save this change. Please try again.' };
}

async function save(kind: 'category' | 'subcategory', originalSlug: string | null, formData: FormData): Promise<CategoryFormState> {
  const keys = kind === 'category'
    ? ['name', 'slug', 'description', 'imageUrl', 'displayOrder']
    : ['name', 'slug', 'categorySlug', 'description', 'displayOrder'];
  const values: Record<string, string> = Object.fromEntries(keys.map((key) => [key, typeof formData.get(key) === 'string' ? String(formData.get(key)) : '']));
  values.isActive = formData.get('isActive') === 'on' ? 'on' : '';
  if (originalSlug !== null && !categoryFields.shape.slug.safeParse(originalSlug).success) return { values, error: 'Invalid original slug.' };
  const input = { ...values, isActive: values.isActive === 'on' };

  if (kind === 'category') {
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return { values, error: parsed.error.issues[0].message };
    const data = parsed.data;
    try {
      const error = await prisma.$transaction(async (tx) => {
        const other = originalSlug === null ? {} : { slug: { not: originalSlug } };
        const duplicate = await tx.category.findFirst({ where: { ...other, OR: [{ slug: data.slug }, { name: { equals: data.name, mode: 'insensitive' } }] } });
        if (duplicate) return 'A category with that name or slug already exists.';
        if (originalSlug === null) await tx.category.create({ data });
        else await tx.category.update({ where: { slug: originalSlug }, data });
        return null;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      if (error) return { values, error };
    } catch (error) {
      return { values, ...databaseError(error) };
    }
  } else {
    const parsed = subcategorySchema.safeParse(input);
    if (!parsed.success) return { values, error: parsed.error.issues[0].message };
    const data = parsed.data;
    try {
      const error = await prisma.$transaction(async (tx) => {
        const other = originalSlug === null ? {} : { slug: { not: originalSlug } };
        if (!await tx.category.findUnique({ where: { slug: data.categorySlug } })) return 'Choose an existing parent category.';
        // Keep the parent fixed so products cannot end up in mismatched categories.
        if (originalSlug !== null) {
          const existing = await tx.subcategory.findUnique({ where: { slug: originalSlug } });
          if (!existing) return 'This subcategory no longer exists.';
          if (existing.categorySlug !== data.categorySlug) return 'A subcategory’s parent cannot be changed here. Refresh the page.';
        }
        const duplicate = await tx.subcategory.findFirst({ where: { ...other, OR: [{ slug: data.slug }, { categorySlug: data.categorySlug, name: { equals: data.name, mode: 'insensitive' } }] } });
        if (duplicate) return 'That subcategory slug is in use, or its name already exists in this category.';
        if (originalSlug === null) await tx.subcategory.create({ data });
        else await tx.subcategory.update({ where: { slug: originalSlug }, data });
        return null;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      if (error) return { values, error };
    } catch (error) {
      return { values, ...databaseError(error) };
    }
  }
  revalidateAdmin();
  return { message: originalSlug === null ? 'Added successfully.' : 'Changes saved.' };
}

export async function createCategory(_previous: CategoryFormState, formData: FormData) {
  await requireAdmin();
  return save('category', null, formData);
}

export async function createSubcategory(_previous: CategoryFormState, formData: FormData) {
  await requireAdmin();
  return save('subcategory', null, formData);
}

export async function updateCategory(slug: string, _previous: CategoryFormState, formData: FormData) {
  await requireAdmin();
  return save('category', slug, formData);
}

export async function updateSubcategory(slug: string, _previous: CategoryFormState, formData: FormData) {
  await requireAdmin();
  return save('subcategory', slug, formData);
}

async function remove(kind: 'category' | 'subcategory', slug: string): Promise<CategoryFormState> {
  if (!categoryFields.shape.slug.safeParse(slug).success) return { error: 'Invalid slug.' };
  try {
    const error = await prisma.$transaction(async (tx) => {
      const products = await tx.product.count({ where: kind === 'category' ? { categorySlug: slug } : { subcategorySlug: slug } });
      if (products > 0) return `Move or delete the ${products} product${products === 1 ? '' : 's'} in this ${kind} first.`;
      if (kind === 'category') {
        const children = await tx.subcategory.count({ where: { categorySlug: slug } });
        if (children > 0) return `Delete the ${children} subcategor${children === 1 ? 'y' : 'ies'} in this category first.`;
        await tx.category.delete({ where: { slug } });
      } else await tx.subcategory.delete({ where: { slug } });
      return null;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (error) return { error };
  } catch (error) {
    return databaseError(error);
  }
  revalidateAdmin();
  return { message: 'Deleted successfully.' };
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  return remove('category', slug);
}

export async function deleteSubcategory(slug: string) {
  await requireAdmin();
  return remove('subcategory', slug);
}
