'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { REVIEW_STATUSES, type ReviewStatusValue } from '@/lib/admin/reviews';
import { prisma } from '@/lib/prisma';

// The storefront reads reviews straight from the database, so only this page needs refreshing.
function refresh() {
  revalidatePath('/admin/reviews');
}

export async function setReviewStatus(id: string, status: ReviewStatusValue) {
  await requireAdmin();
  if (!REVIEW_STATUSES.includes(status)) return;
  // Only published reviews can sit in the home page row.
  await prisma.review.updateMany({ where: { id }, data: { status, ...(status !== 'PUBLISHED' && { featuredOrder: null }) } });
  refresh();
}

// A blank order takes the review out of the home page row.
export async function setReviewFeatured(id: string, formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get('order') ?? '').trim();
  if (raw !== '' && !/^\d{1,2}$/.test(raw)) return;
  const order = raw === '' ? null : Number(raw);
  if (order !== null && order < 1) return;
  await prisma.review.updateMany({ where: { id, status: 'PUBLISHED' }, data: { featuredOrder: order } });
  refresh();
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.deleteMany({ where: { id } });
  refresh();
}
