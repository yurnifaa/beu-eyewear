import WishlistSection from '@/component/WishlistSection';

export default function WishlistPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Saved from the heart icon on any product.</p>
      </div>
      <WishlistSection />
    </div>
  );
}
