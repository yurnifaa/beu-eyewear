import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteProductButton from '@/component/admin/DeleteProductButton';
import ProductForm from '@/component/admin/ProductForm';
import { getProductForEdit, getProductFormOptions } from '@/lib/admin/products';
import { deleteProduct, updateProduct } from '../actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function EditProductPage(props: PageProps<'/admin/products/[id]'>) {
  const { id } = await props.params;
  const [product, options] = await Promise.all([getProductForEdit(id), getProductFormOptions()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <div className="flex items-center gap-3">
          <Link href={`/admin/inventory?q=${encodeURIComponent(product.name)}`} className="text-sm underline hover:text-foreground">
            Adjust stock
          </Link>
          <DeleteProductButton action={deleteProduct.bind(null, product.slug)} productName={product.name} />
        </div>
      </div>
      <ProductForm
        // Remount when the saved product changes, so the form never shows a stale copy.
        key={`${product.slug}:${product.variants.map((variant) => variant.sku).join(',')}`}
        action={updateProduct.bind(null, product.slug)}
        options={options}
        defaults={product}
        isEdit
        submitLabel="Save Changes"
      />
    </div>
  );
}
