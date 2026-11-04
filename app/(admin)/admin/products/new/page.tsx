import ProductForm from '@/component/admin/ProductForm';
import { emptyProductDefaults } from '@/lib/admin/product-form';
import { getNextSortOrder, getProductFormOptions } from '@/lib/admin/products';
import { createProduct } from '../actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [options, nextSortOrder] = await Promise.all([getProductFormOptions(), getNextSortOrder()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm
        action={createProduct}
        options={options}
        defaults={emptyProductDefaults(options, nextSortOrder)}
        isEdit={false}
        submitLabel="Create Product"
      />
    </div>
  );
}
