import { notFound } from 'next/navigation';
import { ShoppingBag, Star } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import Breadcrumb from '@/component/Breadcrumb';
import Button from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import QuantityStepper from '@/component/QuantityStepper';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import WishlistButton from '@/component/WishlistButton';
import { FRAME_MATERIAL_SPECS, LENS_OPTION_INFO } from '@/lib/catalog/specs';
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
  getSubcategoryBySlug,
} from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function Page(props: PageProps<'/listing/[slug]'>) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, subcategory, relatedProducts] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getSubcategoryBySlug(product.subcategorySlug),
    getRelatedProducts(product, 4),
  ]);
  const materialSpec = product.frameMaterial ? FRAME_MATERIAL_SPECS[product.frameMaterial] : undefined;
  const lensInfo = product.lensOption ? LENS_OPTION_INFO[product.lensOption] : undefined;

  const specLine = product.frameMaterial
    ? `${product.frameMaterial} Frame · ${lensInfo ? `${product.lensOption} Coated` : 'UV400 Clear'}`
    : subcategory?.name;

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/home' },
            ...(category ? [{ label: category.name, href: `/listing?category=${category.slug}` }] : []),
            ...(subcategory
              ? [{ label: subcategory.name, href: `/listing?category=${product.categorySlug}&sub=${subcategory.slug}` }]
              : []),
            { label: product.name },
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
          <PlaceholderImage variant="plain" className="aspect-3/4 flex-1 rounded-xl" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {specLine && <p className="mt-1 text-sm text-muted-foreground">{specLine}</p>}
            <p className="mt-3 text-lg font-semibold">{formatPrice(product.price)}</p>
          </div>

          {product.colors.length > 0 && (
            <fieldset>
              <legend className="text-sm font-semibold">Color</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color, i) => (
                  <label key={color} className="cursor-pointer">
                    <input type="radio" name="color" value={color} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                      {color}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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
            <WishlistButton slug={product.slug} name={product.name} variant="labeled" />
          </div>

          <div>
            <AccordionSection title="Product Details" defaultOpen>
              <p>{product.description}</p>
              {materialSpec && (
                <ul className="mt-2 list-disc pl-5">
                  <li>Dimensions (Eye-Bridge-Temple): {materialSpec.dimensions}</li>
                  <li>Weight: {materialSpec.weight}</li>
                  <li>Material: {materialSpec.composition}</li>
                  <li>Nose Pads: {materialSpec.nosePad}</li>
                  <li>Includes a protective case and microfiber cleaning cloth at no additional cost.</li>
                </ul>
              )}
            </AccordionSection>
            {lensInfo && (
              <AccordionSection title="Lens & Coating">
                <p>{lensInfo.description}</p>
              </AccordionSection>
            )}
            <AccordionSection title="Shipping & Return Details">
              <p>
                Free returns within 7 days of delivery. This product is covered by a {product.warrantyYears}-year
                manufacturer&apos;s warranty against defects.
              </p>
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

      {relatedProducts.length > 0 && (
        <Reveal className="px-6 py-14">
          <SectionLabel>You Might Also Like</SectionLabel>
          <ProductRow className="mt-8">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.slug}
                slug={related.slug}
                name={related.name}
                price={formatPrice(related.price)}
                description={related.description}
                href={`/listing/${related.slug}`}
              />
            ))}
          </ProductRow>
        </Reveal>
      )}
    </>
  );
}
