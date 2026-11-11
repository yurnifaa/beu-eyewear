import type { Metadata } from 'next';
import { Tag } from 'lucide-react';
import SupportHeader from '@/component/support/SupportHeader';
import { getOffers } from '@/lib/catalog/queries';

export const metadata: Metadata = { title: 'Vouchers' };
export const dynamic = 'force-dynamic';

export default async function VouchersPage() {
  const offers = await getOffers();

  return (
    <>
      <SupportHeader
        eyebrow="Promotions"
        title="Vouchers & Promos"
        description="Check out available promotions and their terms."
      />

      {offers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active promotions right now. Check back soon!</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {offers.map((offer) => (
            <div key={offer.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-6 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15">
                  <Tag size={18} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-black uppercase tracking-tight">{offer.name}</p>
                  <p className="mt-0.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {offer.badge}
                  </p>
                </div>
              </div>

              {offer.description && <p className="text-sm text-muted-foreground">{offer.description}</p>}

              <div className="flex flex-wrap gap-2 text-xs">
                {offer.eligibility === 'FIRST_ORDER' && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 font-medium text-amber-700">First order only</span>
                )}
                {offer.requiresCode && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">Code required</span>
                )}
                {offer.endsAt && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Until {new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>

              {offer.termsAndConditions && (
                <details className="group">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground underline underline-offset-2 group-open:mb-1">
                    Terms & Conditions
                  </summary>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {offer.termsAndConditions}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
