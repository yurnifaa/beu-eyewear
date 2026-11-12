import 'server-only';

import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type OrderDetail = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Only what the list cards need. Newest first.
export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      total: true,
      items: { orderBy: { id: 'asc' }, select: { id: true, name: true, color: true, quantity: true } },
    },
  });
}

// Scoped to the user, so asking for someone else's order id just returns null.
export async function getOrderForUser(userId: string, id: string): Promise<OrderDetail | null> {
  return prisma.order.findFirst({
    where: { id, userId },
    include: { items: { orderBy: { id: 'asc' } } },
  });
}

// The same lookup, shared by everything in one page render (a page and its generateMetadata both
// need the order). Only for reads that just display it. Code that re-reads an order after changing
// it, such as the payment sync on the order pages, must call getOrderForUser so it sees the update.
export const getOrderForUserOnce = cache(getOrderForUser);
