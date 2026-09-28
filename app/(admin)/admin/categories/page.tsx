import { buttonClassName } from '@/component/Button';
import { getAllSubcategories, getCategories } from '@/lib/catalog/queries';
import { createCategory, createSubcategory } from './actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

const fieldClassName = 'rounded-lg border border-border bg-background px-3 py-2 text-sm';

export default async function CategoriesPage() {
  const [categories, subcategories] = await Promise.all([getCategories(), getAllSubcategories()]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category.slug} className="rounded-xl border border-border p-5">
            <p className="font-bold">
              {category.name} <span className="font-normal text-muted-foreground">({category.slug})</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {subcategories
                .filter((subcategory) => subcategory.categorySlug === category.slug)
                .map((subcategory) => (
                  <li key={subcategory.slug} className="rounded-full bg-muted px-3 py-1 text-xs">
                    {subcategory.name}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <form action={createCategory} className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <p className="font-semibold">Add Category</p>
          <input name="slug" placeholder="Slug (e.g. limited)" required className={fieldClassName} />
          <input name="name" placeholder="Name" required className={fieldClassName} />
          <textarea name="description" placeholder="Description" rows={2} className={fieldClassName} />
          <button type="submit" className={buttonClassName({ variant: 'primary', className: 'self-start uppercase' })}>
            Add Category
          </button>
        </form>

        <form action={createSubcategory} className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <p className="font-semibold">Add Subcategory</p>
          <select name="categorySlug" required className={fieldClassName}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="slug" placeholder="Slug (e.g. rimless)" required className={fieldClassName} />
          <input name="name" placeholder="Name" required className={fieldClassName} />
          <button type="submit" className={buttonClassName({ variant: 'primary', className: 'self-start uppercase' })}>
            Add Subcategory
          </button>
        </form>
      </div>
    </div>
  );
}
