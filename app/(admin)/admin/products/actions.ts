'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function requiredString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function optionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? '').trim();
  return value ? value : undefined;
}

function parseColors(formData: FormData): string[] {
  return String(formData.get('colors') ?? '')
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean);
}

function productData(formData: FormData) {
  return {
    name: requiredString(formData, 'name'),
    description: requiredString(formData, 'description'),
    price: Number(formData.get('price')),
    categorySlug: requiredString(formData, 'categorySlug'),
    subcategorySlug: requiredString(formData, 'subcategorySlug'),
    frameMaterial: optionalString(formData, 'frameMaterial'),
    lensOption: optionalString(formData, 'lensOption'),
    frameShape: optionalString(formData, 'frameShape'),
    colors: parseColors(formData),
    warrantyYears: Number(formData.get('warrantyYears') ?? 1),
  };
}

function revalidateCatalog(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/listing');
  revalidatePath('/home');
  revalidatePath('/search');
  if (slug) revalidatePath(`/listing/${slug}`);
}

export async function createProduct(formData: FormData) {
  const slug = requiredString(formData, 'slug');

  await prisma.product.create({
    data: { slug, ...productData(formData) },
  });

  revalidateCatalog(slug);
  redirect('/admin/products');
}

export async function updateProduct(slug: string, formData: FormData) {
  await prisma.product.update({
    where: { slug },
    data: productData(formData),
  });

  revalidateCatalog(slug);
  redirect('/admin/products');
}

export async function deleteProduct(slug: string) {
  await prisma.product.delete({ where: { slug } });

  revalidateCatalog(slug);
  redirect('/admin/products');
}
