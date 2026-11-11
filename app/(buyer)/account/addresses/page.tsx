import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PixelGlyph from '@/component/beu/PixelGlyph';
import AccountHeader from '@/component/account/AccountHeader';
import Panel from '@/component/account/Panel';
import { requireUser } from '@/lib/auth/session';
import { MAX_SAVED_ADDRESSES } from '@/lib/checkout/address';
import { getSavedAddresses } from '@/lib/checkout/saved-address';
import { deleteAddress, setDefaultAddress } from './actions';

export const metadata: Metadata = { title: 'Address Book' };

const chip = 'beu-chip inline-flex h-9 items-center px-4 text-[11px] uppercase tracking-[0.12em]';

export default async function AddressesPage() {
  // Checked here rather than in account/layout.tsx so /account/wishlist
  // (localStorage-backed) stays usable without signing in.
  const user = await requireUser('/account/addresses');
  const addresses = await getSavedAddresses(user.id);
  const atLimit = addresses.length >= MAX_SAVED_ADDRESSES;

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader
        eyebrow="Address book"
        title="Where to?"
        description="Your saved shipping addresses. The default is preselected at checkout."
      >
        <span className="beu-chip inline-flex h-9 items-center px-4 text-[11px] uppercase tracking-[0.18em]">
          [ {addresses.length} / {MAX_SAVED_ADDRESSES} ]
        </span>
      </AccountHeader>

      {addresses.length === 0 ? (
        <Panel className="flex flex-col items-center gap-4 py-14 text-center">
          <PixelGlyph name="cross" size={56} className="text-foreground" />
          <p className="font-display text-xl font-black uppercase tracking-[-0.03em]">No addresses yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Save one now and checkout gets a lot faster.</p>
          <Link
            href="/account/addresses/new"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
          >
            <Plus size={16} aria-hidden="true" />
            Add your first address
          </Link>
        </Panel>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {addresses.map((address, i) => (
            <li
              key={address.id}
              className={`flex flex-col justify-between gap-6 rounded-3xl border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur ${
                address.isDefault ? 'border-accent ring-1 ring-accent' : 'border-border'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-[0.18em] text-muted-foreground">[ 0{i + 1} ]</span>
                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                      <PixelGlyph name="star5" size={12} />
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-4 break-words font-display text-lg font-black uppercase tracking-[-0.02em]">
                  {address.label || address.fullName}
                </p>
                {address.label && <p className="mt-1 text-sm">{address.fullName}</p>}
                <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
                  <span className="break-words">{address.address}</span>
                  <br />
                  {address.city}, {address.province} {address.zip}
                  <br />
                  {address.phone}
                </address>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/account/addresses/${address.id}/edit`} className={chip}>
                  Edit
                </Link>
                {!address.isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <button type="submit" className={chip}>
                      Set as default
                    </button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <button type="submit" className={`${chip} text-red-600`}>
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}

          {!atLimit && (
            <li>
              <Link
                href="/account/addresses/new"
                className="group flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-accent hover:bg-accent/5"
              >
                <span className="beu-gloss grid size-12 place-items-center rounded-full transition-transform group-hover:scale-110">
                  <Plus size={20} aria-hidden="true" />
                </span>
                <span className="text-xs uppercase tracking-[0.14em]">Add address</span>
              </Link>
            </li>
          )}
        </ul>
      )}

      {atLimit && (
        <p className="text-xs text-muted-foreground">
          You&apos;ve reached the limit of {MAX_SAVED_ADDRESSES} saved addresses. Delete one to add another.
        </p>
      )}
    </div>
  );
}
