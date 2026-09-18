import { ChevronDown, ChevronRight, ListFilter } from 'lucide-react';
import Breadcrumb from '@/component/Breadcrumb';
import Button from '@/component/Button';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';

const FILTERS = ['Frames', 'Lenses', 'Material', 'Style'];

const SUBCATEGORIES = ['Subcategory', 'Subcategory', 'Subcategory'];

function SubcategoryHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-1 text-sm font-semibold">
      <span>{children}</span>
      <ChevronRight size={16} />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6 text-center">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Category' }]} />
        <h1 className="mt-8 text-3xl font-bold uppercase tracking-tight md:text-4xl">Category</h1>
        <p className="mt-2 text-sm text-muted-foreground">Brief description of the category.</p>
      </Reveal>

      <Reveal className="flex flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="hidden items-center gap-6 md:flex">
          {FILTERS.map((label) => (
            <Button key={label} variant="ghost" size="sm">
              {label}
              <ChevronDown size={14} />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="sm">
            Filter
            <ListFilter size={14} />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="self-end md:self-auto">
          Sort
          <ListFilter size={14} />
        </Button>
      </Reveal>

      {SUBCATEGORIES.map((label, rowIndex) => (
        <Reveal key={rowIndex} className="px-6 pb-14">
          <SubcategoryHeading>{label}</SubcategoryHeading>
          <ProductRow className="mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCard
                key={i}
                name="Product Name"
                price="₱3,000"
                description="Brief product description"
                href={`/listing/${rowIndex * 4 + i + 1}`}
              />
            ))}
          </ProductRow>
        </Reveal>
      ))}

      <Reveal className="flex items-center justify-center gap-3 px-6 py-14">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
          1
        </span>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          3
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0" aria-label="Next page">
          <ChevronRight size={16} />
        </Button>
      </Reveal>
    </>
  );
}
