import AccountHeader from '@/component/account/AccountHeader';
import WishlistSection from '@/component/WishlistSection';

export default function WishlistPage() {
  return (
    <div className="flex flex-col gap-8">
      <AccountHeader eyebrow="Wishlist" title="Saved for later" description="Saved from the heart icon on any product." />
      <WishlistSection />
    </div>
  );
}
