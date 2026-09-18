import { Heart, ShoppingBag, Star } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import Breadcrumb from '@/component/Breadcrumb';
import Button from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import QuantityStepper from '@/component/QuantityStepper';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';

export default async function Page(props: PageProps<'/listing/[id]'>) {
  await props.params;

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/home' },
            { label: 'Category', href: '/listing' },
            { label: 'Subcategory', href: '/listing' },
            { label: 'Product 1' },
          ]}
        />
      </Reveal>

      <Reveal mode="mount" className="grid grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-row gap-3 md:flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <PlaceholderImage key={i} variant="plain" className="h-16 w-16 shrink-0 rounded-md" />
            ))}
          </div>
          <PlaceholderImage variant="plain" className="aspect-[3/4] flex-1 rounded-xl" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Product 1 Name</h1>
            <p className="mt-1 text-sm text-muted-foreground">Product Specification/Material</p>
            <p className="mt-3 text-lg font-semibold">₱ 3,000</p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted p-4">
            <div className="flex items-center gap-3">
              <span className="h-4 w-12 rounded bg-card" />
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-8 w-8 rounded-md bg-card" />
              ))}
            </div>
            <span className="h-4 w-16 rounded bg-card" />
          </div>

          <div>
            <p className="text-sm font-semibold">Quantity</p>
            <div className="mt-2">
              <QuantityStepper />
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="primary" className="uppercase">
              <ShoppingBag size={16} />
              Add to Bag
            </Button>
            <Button variant="secondary" className="bg-muted uppercase">
              <Heart size={16} />
              Favourite
            </Button>
          </div>

          <div>
            <AccordionSection title="Product Details" defaultOpen>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mattis diam vitae turpis maximus,
                non posuere nisl dapibus. Etiam mollis neque non velit dapibus laoreet.
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>Lorem Ipsum</li>
                <li>Dolor Sit amet</li>
              </ul>
            </AccordionSection>
            <AccordionSection title="Shipping & Return Details">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </AccordionSection>
            <AccordionSection
              title="Reviews & Ratings (0)"
              extra={
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-muted-foreground" />
                  ))}
                </span>
              }
            >
              <p>No reviews yet.</p>
            </AccordionSection>
          </div>
        </div>
      </Reveal>

      <Reveal className="px-6 py-14">
        <SectionLabel>You Might Also Like</SectionLabel>
        <ProductRow className="mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCard
              key={i}
              name="Product Name"
              price="Price"
              description="Brief product description"
              href={`/listing/${i + 1}`}
            />
          ))}
        </ProductRow>
      </Reveal>
    </>
  );
}
