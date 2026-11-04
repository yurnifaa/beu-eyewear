import { redirect } from 'next/navigation';
import AccountHeader from '@/component/account/AccountHeader';
import AddressForm from '@/component/account/AddressForm';
import Panel from '@/component/account/Panel';
import { requireUser } from '@/lib/auth/session';
import { MAX_SAVED_ADDRESSES } from '@/lib/checkout/address';
import { getSavedAddresses } from '@/lib/checkout/saved-address';

export default async function NewAddressPage() {
  const user = await requireUser('/account/addresses/new');
  const addresses = await getSavedAddresses(user.id);
  if (addresses.length >= MAX_SAVED_ADDRESSES) redirect('/account/addresses');

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader eyebrow="Address book" title="Add address" back={{ href: '/account/addresses', label: 'Address book' }} />
      <Panel title="Address details" className="max-w-2xl">
        <AddressForm defaultName={user.name} isFirst={addresses.length === 0} />
      </Panel>
    </div>
  );
}
