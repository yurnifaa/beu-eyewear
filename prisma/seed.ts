// Loads prisma/seed-data/catalog.json (the catalog as imported from the old Google Sheet)
// into Postgres: `npx prisma db seed`.
//
// Safe to re-run. It only creates what is missing and never overwrites rows, so it can't
// undo admin edits or reset live stock. A product that already exists is skipped whole,
// including its colors and stock.
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../lib/prisma';
import type { CatalogSnapshot } from './seed-data/snapshot';

const snapshot = JSON.parse(readFileSync(join(__dirname, 'seed-data', 'catalog.json'), 'utf8')) as CatalogSnapshot;

async function main() {
  const counts: Record<string, number> = {};
  const created = (label: string, result: { count: number }) => {
    counts[label] = result.count;
  };

  created('categories', await prisma.category.createMany({ data: snapshot.categories, skipDuplicates: true }));
  created('subcategories', await prisma.subcategory.createMany({ data: snapshot.subcategories, skipDuplicates: true }));

  // Categories left over from the old seed exist but still have the default display order
  // (99). Fill those from the snapshot; a row an admin has ordered is left alone.
  let filledIn = 0;
  for (const { slug, ...data } of snapshot.categories) {
    filledIn += (await prisma.category.updateMany({ where: { slug, displayOrder: 99 }, data })).count;
  }
  for (const { slug, ...data } of snapshot.subcategories) {
    filledIn += (await prisma.subcategory.updateMany({ where: { slug, displayOrder: 99 }, data })).count;
  }
  counts['category rows filled in'] = filledIn;

  const existing = new Set((await prisma.product.findMany({ select: { slug: true } })).map((product) => product.slug));
  const fresh = snapshot.products.filter((product) => !existing.has(product.slug));

  await prisma.$transaction(
    async (tx) => {
      created(
        'products',
        await tx.product.createMany({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the colors are created below
          data: fresh.map(({ variants, createdAt, ...product }) => ({ ...product, createdAt: new Date(createdAt) })),
        }),
      );
      const variants = fresh.flatMap((product) =>
        product.variants.map(({ stock, ...variant }) => ({ ...variant, productSlug: product.slug, stockQuantity: stock })),
      );
      created('variants', await tx.productVariant.createMany({ data: variants, skipDuplicates: true }));
      // Opening stock gets a movement, so the stock history starts from the import.
      created(
        'opening stock movements',
        await tx.stockMovement.createMany({
          data: variants
            .filter((variant) => variant.stockQuantity > 0)
            .map((variant) => ({
              sku: variant.sku,
              type: 'ADJUSTMENT' as const,
              quantityChange: variant.stockQuantity,
              stockAfter: variant.stockQuantity,
              reason: 'Opening stock (imported from Google Sheet)',
            })),
        }),
      );
    },
    { maxWait: 10_000, timeout: 60_000 },
  );

  // Products seeded before sortOrder existed sit at 0; give them the Sheet's order.
  let ordered = 0;
  for (const { slug, sortOrder } of snapshot.products) {
    ordered += (await prisma.product.updateMany({ where: { slug, sortOrder: 0 }, data: { sortOrder } })).count;
  }
  counts['products given a display order'] = ordered;

  const slugs = new Set([...existing, ...snapshot.products.map((product) => product.slug)]);
  created(
    'reviews',
    await prisma.review.createMany({
      data: snapshot.reviews.filter((review) => slugs.has(review.productSlug)).map((review) => ({ ...review, createdAt: new Date(review.createdAt) })),
      skipDuplicates: true,
    }),
  );

  created(
    'settings',
    await prisma.storeSetting.createMany({
      data: Object.entries(snapshot.settings).map(([key, value]) => ({ key, value })),
      skipDuplicates: true,
    }),
  );
  created('shipping rates', await prisma.shippingRate.createMany({ data: snapshot.shippingRates, skipDuplicates: true }));
  created('frame materials', await prisma.frameMaterialInfo.createMany({ data: snapshot.frameMaterials, skipDuplicates: true }));
  created('lens options', await prisma.lensOptionInfo.createMany({ data: snapshot.lensOptions, skipDuplicates: true }));
  created('filter options', await prisma.filterOption.createMany({ data: snapshot.filterOptions, skipDuplicates: true }));

  // These have no natural key, so only fill them while the table is still empty.
  if ((await prisma.offer.count()) === 0) {
    created(
      'offers',
      await prisma.offer.createMany({ data: snapshot.offers.map((offer) => ({ ...offer, endsAt: offer.endsAt ? new Date(offer.endsAt) : null })) }),
    );
  }
  if ((await prisma.bundleItem.count()) === 0) {
    created('bundle items', await prisma.bundleItem.createMany({ data: snapshot.bundleItems.filter((item) => slugs.has(item.bundleSlug)) }));
  }

  console.log('Catalog seeded (rows created this run):');
  console.table(counts);
  if (snapshot.defaultedTabs.length > 0) {
    console.log(`Filled from built-in defaults (the Sheet tabs were not available): ${snapshot.defaultedTabs.join(', ')}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
