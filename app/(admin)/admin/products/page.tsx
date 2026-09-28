import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import { prisma } from '@/lib/prisma';
import { getCategories } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    prisma.product.findMany({ orderBy: { slug: 'asc' } }),
  ]);
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{categoryName(product.categorySlug)}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.slug}`} className="underline hover:text-foreground">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">{products.length} products.</p>
    </div>
  );
}
