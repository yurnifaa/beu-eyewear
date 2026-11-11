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
  code: string | null;
  maxRedemptions: number | null;
  termsAndConditions: string;
  minOrderAmount: number | null;
}): FieldConfig[] {
  return [
    { type: 'text', name: 'name', label: 'Name', value: offer?.name, required: true, maxLength: 80, wide: true },
    { type: 'textarea', name: 'description', label: 'Description', value: offer?.description, maxLength: 300, wide: true },
    { type: 'text', name: 'badge', label: 'Badge label', value: offer?.badge ?? 'Offer', required: true, maxLength: 30, hint: 'Shown on the ticket stub, e.g. "5% Off".' },
    { type: 'select', name: 'kind', label: 'Type', value: offer?.kind ?? 'PERCENT', options: KIND_OPTIONS },
    { type: 'number', name: 'value', label: 'Value', value: String(offer?.value ?? 0), required: true, hint: 'A percentage, or pesos for a fixed amount.' },
    { type: 'select', name: 'eligibility', label: 'Who it is for', value: offer?.eligibility ?? 'NONE', options: ELIGIBILITY_OPTIONS },
    { type: 'text', name: 'code', label: 'Promo code', value: offer?.code ?? '', maxLength: 50, hint: 'Leave blank for display-only offers.' },
    { type: 'number', name: 'maxRedemptions', label: 'Max redemptions', value: offer?.maxRedemptions != null ? String(offer.maxRedemptions) : '', hint: 'Leave blank for unlimited.' },
    { type: 'number', name: 'minOrderAmount', label: 'Min order (₱)', value: offer?.minOrderAmount != null ? String(offer.minOrderAmount) : '', hint: 'Minimum subtotal to use this code.' },
    { type: 'date', name: 'endsAt', label: 'Last day (optional)', value: offer?.endsAt ? offer.endsAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) : '' },
    { type: 'textarea', name: 'termsAndConditions', label: 'Terms & conditions', value: offer?.termsAndConditions ?? '', maxLength: 2000, wide: true },
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
        <h1 className="text-2xl font-bold">Offers & Promo Codes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage promotions and promo codes. Offers with a code apply a discount at checkout when the code is entered.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {offers.length === 0 && <p className="text-sm text-muted-foreground">No offers yet. Add the first one below.</p>}
        {offers.map((offer) => {
          const ended = offer.endsAt !== null && offer.endsAt <= now;
          const fullyRedeemed = offer.maxRedemptions !== null && offer.currentRedemptions >= offer.maxRedemptions;
          return (
            <div key={offer.id} className="rounded-xl border border-border bg-background p-5">
              <p className="flex flex-wrap items-center gap-2 font-bold">
                {offer.name}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{offer.badge}</span>
                {offer.code && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-xs font-semibold text-accent">{offer.code}</span>
                )}
                {(!offer.isActive || ended || fullyRedeemed) && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {fullyRedeemed ? 'Fully redeemed' : ended ? 'Ended' : 'Hidden'}
                  </span>
                )}
              </p>
              {offer.description && <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{offer.kind === 'PERCENT' ? `${offer.value}%` : `₱${offer.value}`} off</span>
                <span>{offer.eligibility === 'FIRST_ORDER' ? 'First order only' : 'Everyone'}</span>
                {offer.code && (
                  <span>
                    Used {offer.currentRedemptions}{offer.maxRedemptions !== null ? ` / ${offer.maxRedemptions}` : ''} times
                  </span>
                )}
                {offer.minOrderAmount !== null && <span>Min order: ₱{offer.minOrderAmount.toLocaleString()}</span>}
                {offer.endsAt && <span>Ends: {offer.endsAt.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer text-sm font-semibold">Edit offer</summary>
                  <div className="mt-3 max-w-2xl">
                    <ConfigForm action={updateOffer.bind(null, offer.id)} fields={offerFields(offer)} submitLabel="Save changes" />
                  </div>
                </details>
                <ConfirmSubmitButton action={deleteOffer.bind(null, offer.id)} label="Delete" danger message={`Delete "${offer.name}"? To keep it but stop showing it, untick "Shown in the shop" instead.`} />
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
