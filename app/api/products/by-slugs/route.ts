import { NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/catalog/queries';
import { toProductDTO } from '@/lib/catalog/dto';

const MAX_SLUGS = 100;

// Cart, checkout and wishlist look their items up here. The response is built from the
// sheet-backed catalog but only carries storefront fields: nothing that says where the
// data came from.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slugs: string[] = Array.isArray(body?.slugs)
    ? body.slugs.filter((slug: unknown): slug is string => typeof slug === 'string' && slug.length > 0 && slug.length <= 200).slice(0, MAX_SLUGS)
    : [];

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getProductsBySlugs(slugs);
    return NextResponse.json({ products: products.map(toProductDTO) });
  } catch (error) {
    console.error('by-slugs lookup failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Catalog temporarily unavailable.' }, { status: 503 });
  }
}
