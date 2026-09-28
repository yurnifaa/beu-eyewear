import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slugs = Array.isArray(body?.slugs) ? body.slugs.filter((slug: unknown) => typeof slug === 'string') : [];

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({ where: { slug: { in: slugs } } });
  return NextResponse.json({ products });
}
