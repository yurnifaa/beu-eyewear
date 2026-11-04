import ConfigForm from '@/component/admin/ConfigForm';
import type { FieldConfig } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { SETTING_FIELDS } from '@/lib/catalog/settings';
import { SHIPPING_METHODS } from '@/lib/checkout/shipping';
import { prisma } from '@/lib/prisma';
import { saveSettings, saveShippingRate } from './actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAdmin();
  const [rows, rates] = await Promise.all([prisma.storeSetting.findMany(), prisma.shippingRate.findMany()]);
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const rateByMethod = new Map(rates.map((rate) => [rate.method, rate]));

  const settingFields: FieldConfig[] = SETTING_FIELDS.map((field) => ({
    type: field.kind === 'number' ? 'number' : 'text',
    name: field.key,
    label: field.label,
    hint: field.hint || undefined,
    value: stored.get(field.key) ?? field.fallback,
    maxLength: 300,
  }));

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store details and delivery options. The shop reads these straight from the database, so a change shows on the next page load.</p>
      </div>

      <section aria-labelledby="store-title" className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
        <h2 id="store-title" className="text-sm font-bold uppercase tracking-wide">Store</h2>
        <ConfigForm action={saveSettings} fields={settingFields} submitLabel="Save settings" />
      </section>

      <section aria-labelledby="shipping-title" className="flex flex-col gap-4">
        <div>
          <h2 id="shipping-title" className="text-sm font-bold uppercase tracking-wide">Delivery options</h2>
          <p className="mt-1 text-sm text-muted-foreground">The two options customers choose between at checkout. A switched-off option isn’t offered.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(['STANDARD', 'EXPRESS'] as const).map((method) => {
            const rate = rateByMethod.get(method) ?? { ...SHIPPING_METHODS[method], isActive: true };
            return (
              <div key={method} className="rounded-xl border border-border bg-background p-5">
                <p className="mb-3 font-semibold">{method === 'STANDARD' ? 'Standard' : 'Express'} delivery</p>
                <ConfigForm
                  action={saveShippingRate.bind(null, method)}
                  submitLabel="Save"
                  fields={[
                    { type: 'text', name: 'label', label: 'Name', value: rate.label, required: true, maxLength: 40 },
                    { type: 'number', name: 'fee', label: 'Fee (₱)', value: String(rate.fee), required: true },
                    { type: 'number', name: 'minDays', label: 'Fastest (business days)', value: String(rate.minDays), required: true },
                    { type: 'number', name: 'maxDays', label: 'Slowest (business days)', value: String(rate.maxDays), required: true },
                    { type: 'checkbox', name: 'isActive', label: 'Offered at checkout', checked: rate.isActive },
                  ]}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
