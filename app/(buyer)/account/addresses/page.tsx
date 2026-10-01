import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import { requireUser } from '@/lib/auth/session';
import { getSavedAddress } from '@/lib/checkout/saved-address';
import { removeSavedAddress } from './actions';

export default async function AddressesPage() {
  // Checked here rather than in account/layout.tsx so /account/wishlist
  // (localStorage-backed) stays usable without signing in.
  const user = await requireUser('/account/addresses');
  const address = await getSavedAddress(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Address Book</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The address we prefill when you check out. Tick &ldquo;Update my saved address&rdquo; at checkout to change it.
        </p>
      </div>

      {address ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border p-6">
          <div className="min-w-0 text-sm">
            <p className="text-base font-bold">{address.fullName}</p>
            <p className="mt-1 wrap-break-word text-muted-foreground">{address.address}</p>
            <p className="text-muted-foreground">
              {address.city}, {address.province} {address.zip}
            </p>
            <p className="text-muted-foreground">{address.phone}</p>
          </div>
          <form action={removeSavedAddress}>
            <button type="submit" className={buttonClassName({ variant: 'secondary' })}>
              Remove
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">
            No saved address yet. You can save one when you check out.
          </p>
          <Link href="/cart" className={buttonClassName({ variant: 'primary', className: 'mt-4' })}>
            Go to Cart
          </Link>
        </div>
      )}
    </div>
  );
}
