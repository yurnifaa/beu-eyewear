import Image from 'next/image';

// A small square preview of a product photo, shared by the product form's photo sections.
export default function PhotoThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
      <Image src={src} alt={alt} fill sizes="80px" unoptimized className="object-cover" />
    </div>
  );
}
