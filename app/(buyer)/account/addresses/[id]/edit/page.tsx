import { notFound } from 'next/navigation';
import AccountHeader from '@/component/account/AccountHeader';
import AddressForm from '@/component/account/AddressForm';
import Panel from '@/component/account/Panel';
import { requireUser } from '@/lib/auth/session';
import { getSavedAddress } from '@/lib/checkout/saved-address';

export default async function EditAddressPage(props: PageProps<'/account/addresses/[id]/edit'>) {
  const { id } = await props.params;
  const user = await requireUser(`/account/addresses/${id}/edit`);

  const address = await getSavedAddress(user.id, id);
  if (!address) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader eyebrow="Address book" title="Edit address" back={{ href: '/account/addresses', label: 'Address book' }} />
      <Panel title="Address details" className="max-w-2xl">
        <AddressForm address={address} />
      </Panel>
    </div>
  );
}
