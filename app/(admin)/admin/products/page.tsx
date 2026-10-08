import Image from 'next/image';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { buttonClassName } from '@/component/Button';
import DeleteProductButton from '@/component/admin/DeleteProductButton';
import { LOW_STOCK_THRESHOLD } from '@/lib/catalog/types';
import { getCategories } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { deleteProduct } from './actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

const filterClassName = 'rounded-lg border border-border bg-background px-3 py-2 text-sm';

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) {
    return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600">Out of stock</span>;
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">
        Low · {quantity}
      </span>
    );
  }
  return <span>{quantity}</span>;
}

export default async function ProductsPage(props: PageProps<'/admin/products'>) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';

  const where: Prisma.ProductWhereInput = {
    ...(category && { categorySlug: category }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [categories, products, totalCount] = await Promise.all([
    getCategories(),
    prisma.product.findMany({ where, orderBy: { slug: 'asc' } }),
    prisma.product.count(),
  ]);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const isFiltered = Boolean(q || category);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
          Add Product
        </Link>
      </div>

      {/* Plain GET form: filters live in the URL, so they survive refresh and can be shared. */}
      <form className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or slug"
          aria-label="Search products"
          className={`${filterClassName} w-64`}
        />
        <select name="category" defaultValue={category} aria-label="Filter by category" className={filterClassName}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClassName({ variant: 'secondary' })}>
          Filter
        </button>
        {isFiltered && (
          <Link href="/admin/products" className="text-sm text-muted-foreground underline hover:text-foreground">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Photo</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-11 overflow-hidden rounded-md border border-border bg-card">
                    {product.imageUrl && (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="44px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{categoryName(product.categorySlug)}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <StockBadge quantity={product.stockQuantity} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${product.slug}`} className="underline hover:text-foreground">
                      Edit
                    </Link>
                    <DeleteProductButton
                      action={deleteProduct.bind(null, product.slug)}
                      productName={product.name}
                      size="sm"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {isFiltered ? 'No products match your filters.' : 'No products yet. Add your first one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {isFiltered ? `${products.length} of ${totalCount} products.` : `${totalCount} products.`}
      </p>
    </div>
  );
}
