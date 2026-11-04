import 'server-only';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const REVIEW_PAGE_SIZE = 20;

export const REVIEW_STATUSES = ['PUBLISHED', 'PENDING', 'HIDDEN'] as const;
export type ReviewStatusValue = (typeof REVIEW_STATUSES)[number];

export const REVIEW_STATUS_LABELS: Record<ReviewStatusValue, string> = {
  PUBLISHED: 'Published',
  PENDING: 'Pending',
  HIDDEN: 'Hidden',
};

export function parseReviewFilters(params: Record<string, string | string[] | undefined>) {
  const text = (key: string) => (typeof params[key] === 'string' ? (params[key] as string).trim().slice(0, 120) : '');
  const status = REVIEW_STATUSES.find((value) => value === text('status')) ?? null;
  const page = Number(text('page'));
  return { status, q: text('q'), page: Number.isInteger(page) && page > 0 ? page : 1 };
}

export async function getAdminReviews({ status, q, page }: ReturnType<typeof parseReviewFilters>) {
  const where: Prisma.ReviewWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
        { authorName: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };
  const [total, grouped] = await Promise.all([prisma.review.count({ where }), prisma.review.groupBy({ by: ['status'], _count: { _all: true } })]);
  const totalPages = Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const reviews = await prisma.review.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (current - 1) * REVIEW_PAGE_SIZE,
    take: REVIEW_PAGE_SIZE,
    include: { product: { select: { slug: true, name: true } } },
  });
  const counts = Object.fromEntries(grouped.map((row) => [row.status, row._count._all])) as Partial<Record<ReviewStatusValue, number>>;
  return { reviews, total, page: current, totalPages, counts };
}
