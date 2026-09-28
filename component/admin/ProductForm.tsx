import { buttonClassName } from '@/component/Button';
import { FRAME_MATERIALS, FRAME_SHAPES, LENS_OPTIONS } from '@/lib/catalog/enums';
import type { Category, Product, Subcategory } from '@/lib/catalog/types';

const fieldClassName = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';
const labelClassName = 'text-sm font-semibold';

export interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  subcategories: Subcategory[];
  defaultValues?: Product;
  submitLabel: string;
}

export default function ProductForm({ action, categories, subcategories, defaultValues, submitLabel }: ProductFormProps) {
  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <div>
        <label className={labelClassName} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={defaultValues?.slug}
          required
          readOnly={Boolean(defaultValues)}
          className={`${fieldClassName} ${defaultValues ? 'opacity-60' : ''}`}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" defaultValue={defaultValues?.name} required className={fieldClassName} />
      </div>

      <div>
        <label className={labelClassName} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
          rows={3}
          className={fieldClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClassName} htmlFor="price">
            Price (₱)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={defaultValues?.price}
            required
            className={fieldClassName}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="warrantyYears">
            Warranty (years)
          </label>
          <input
            id="warrantyYears"
            name="warrantyYears"
            type="number"
            min={0}
            step={1}
            defaultValue={defaultValues?.warrantyYears ?? 1}
            required
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClassName} htmlFor="categorySlug">
            Category
          </label>
          <select id="categorySlug" name="categorySlug" defaultValue={defaultValues?.categorySlug} required className={fieldClassName}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName} htmlFor="subcategorySlug">
            Subcategory
          </label>
          <select
            id="subcategorySlug"
            name="subcategorySlug"
            defaultValue={defaultValues?.subcategorySlug}
            required
            className={fieldClassName}
          >
            {subcategories.map((subcategory) => (
              <option key={subcategory.slug} value={subcategory.slug}>
                {categoryName(subcategory.categorySlug)} — {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClassName} htmlFor="frameMaterial">
            Frame Material
          </label>
          <select id="frameMaterial" name="frameMaterial" defaultValue={defaultValues?.frameMaterial ?? ''} className={fieldClassName}>
            <option value="">—</option>
            {FRAME_MATERIALS.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName} htmlFor="lensOption">
            Lens Option
          </label>
          <select id="lensOption" name="lensOption" defaultValue={defaultValues?.lensOption ?? ''} className={fieldClassName}>
            <option value="">—</option>
            {LENS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName} htmlFor="frameShape">
            Frame Shape
          </label>
          <select id="frameShape" name="frameShape" defaultValue={defaultValues?.frameShape ?? ''} className={fieldClassName}>
            <option value="">—</option>
            {FRAME_SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName} htmlFor="colors">
          Colors (comma-separated)
        </label>
        <input
          id="colors"
          name="colors"
          defaultValue={defaultValues?.colors.join(', ')}
          placeholder="Matte Black, Tortoiseshell"
          className={fieldClassName}
        />
      </div>

      <button type="submit" className={buttonClassName({ variant: 'primary', className: 'mt-2 self-start uppercase' })}>
        {submitLabel}
      </button>
    </form>
  );
}
