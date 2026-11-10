'use client';

import ProductGallery from '@/component/product/ProductGallery';
import { useProductColor } from '@/component/product/ProductColorProvider';

// The product gallery for whichever color is selected. The key restarts the gallery at its first
// photo when the picture set changes.
export default function ColorGallery({ alt }: { alt: string }) {
  const { gallery } = useProductColor();
  return <ProductGallery key={gallery.key} images={gallery.images} alt={alt} />;
}
