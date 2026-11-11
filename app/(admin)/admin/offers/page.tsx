import ConfigForm from '@/component/admin/ConfigForm';
import ConfirmSubmitButton from '@/component/admin/ConfirmSubmitButton';
import type { FieldConfig } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createOffer, deleteOffer, updateOffer } from './actions';

export const dynamic = 'force-dynamic';

const KIND_OPTIONS = [
  { value: 'PERCENT', label: 'Percent off' },
  { value: 'FIXED_AMOUNT', label: 'Fixed amount (₱)' },
];
const ELIGIBILITY_OPTIONS = [
  { value: 'NONE', label: 'Everyone' },
  { value: 'FIRST_ORDER', label: 'First order' },
];

function offerFields(offer?: {
  name: string;
  description: string;
  badge: string;
  kind: string;
  value: number;
  eligibility: string;
  requiresCode: boolean;
  isActive: boolean;
  endsAt: Date | null;
}): FieldConfig[] {
  return [
    { type: 'text', name: 'name', label: 'Name', value: offer?.name, required: true, maxLength: 80, wide: true },
    { type: 'textarea', name: 'description', label: 'Description', value: offer?.description, maxLength: 300, wide: true },
    { type: 'text', name: 'badge', label: 'Badge label', value: offer?.badge ?? 'Offer', required: true, maxLength: 30, hint: 'Shown on the ticket stub, e.g. “5% Off”.' },
    { type: 'select', name: 'kind', label: 'Type', value: offer?.kind ?? 'PERCENT', options: KIND_OPTIONS },
    { type: 'number', name: 'value', label: 'Value', value: String(offer?.value ?? 0), required: true, hint: 'A percentage, or pesos for a fixed amount.' },
    { type: 'select', name: 'eligibility', label: 'Who it’s for', value: offer?.eligibility ?? 'NONE', options: ELIGIBILITY_OPTIONS },
    { type: 'date', name: 'endsAt', label: 'Last day (optional)', value: offer?.endsAt ? offer.endsAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) : '' },
    { type: 'checkbox', name: 'requiresCode', label: 'Needs a promo code', checked: offer?.requiresCode ?? false },
    { type: 'checkbox', name: 'isActive', label: 'Shown in the shop', checked: offer?.isActive ?? true },
  ];
}

export default async function OffersPage() {
  await requireAdmin();
  const offers = await prisma.offer.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  const now = new Date();

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Promotions shown on the home page and product pages. Product prices already include any sale price, so an offer
          is a message to shoppers: it doesn’t change what checkout charges.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {offers.length === 0 && <p className="text-sm text-muted-foreground">No offers yet. Add the first one below.</p>}
        {offers.map((offer) => {
          const ended = offer.endsAt !== null && offer.endsAt <= now;
          return (
            <div key={offer.id} className="rounded-xl border border-border bg-background p-5">
              <p className="font-bold">
                {offer.name}
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{offer.badge}</span>
                {(!offer.isActive || ended) && (
                  <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700">{ended ? 'Ended' : 'Hidden'}</span>
                )}
              </p>
              {offer.description && <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>}
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer text-sm font-semibold">Edit offer</summary>
                  <div className="mt-3 max-w-2xl">
                    <ConfigForm action={updateOffer.bind(null, offer.id)} fields={offerFields(offer)} submitLabel="Save changes" />
                  </div>
                </details>
                <ConfirmSubmitButton action={deleteOffer.bind(null, offer.id)} label="Delete" danger message={`Delete “${offer.name}”? To keep it but stop showing it, untick “Shown in the shop” instead.`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="mb-3 font-semibold">Add offer</p>
        <ConfigForm action={createOffer} fields={offerFields()} submitLabel="Add offer" />
      </div>
    </div>
  );
}
