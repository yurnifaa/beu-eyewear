'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

function revalidateCatalog() {
  revalidatePath('/admin/categories');
  revalidatePath('/listing');
  revalidatePath('/home');
  revalidatePath('/search');
}

export async function createCategory(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!slug || !name) return;

  await prisma.category.create({ data: { slug, name, description } });
  revalidateCatalog();
}

export async function createSubcategory(formData: FormData) {
  const slug = String(formData.get('slug') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const categorySlug = String(formData.get('categorySlug') ?? '').trim();
  if (!slug || !name || !categorySlug) return;

  await prisma.subcategory.create({ data: { slug, name, categorySlug } });
  revalidateCatalog();
}
