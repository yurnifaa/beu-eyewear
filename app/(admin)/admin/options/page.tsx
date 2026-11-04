import ConfigForm from '@/component/admin/ConfigForm';
import ConfirmSubmitButton from '@/component/admin/ConfirmSubmitButton';
import type { FieldConfig } from '@/lib/admin/config-form';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import {
  createFilterOption,
  createFrameMaterial,
  createLensOption,
  deleteFilterOption,
  deleteFrameMaterial,
  deleteLensOption,
  updateFilterOption,
  updateFrameMaterial,
  updateLensOption,
} from './actions';

export const dynamic = 'force-dynamic';

const KINDS = [
  { kind: 'FRAME_MATERIAL', title: 'Frame materials', note: 'The choices in the shop’s material filter and the product form.' },
  { kind: 'LENS_OPTION', title: 'Lens options', note: 'The choices in the shop’s lens filter and the product form.' },
  { kind: 'FRAME_SHAPE', title: 'Frame shapes', note: 'Shown in the shop’s shape filter and the home page shape picker.' },
  { kind: 'COLOR_FAMILY', title: 'Color families', note: 'Groups colors for the shop’s color filter. The swatch is the dot shown next to the name.' },
] as const;

const Hidden = () => <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Hidden</span>;

function filterFields(option?: { label: string; hex: string | null; displayOrder: number; isActive: boolean }, withKeys?: boolean): FieldConfig[] {
  return [
    ...(withKeys
      ? ([
          {
            type: 'select',
            name: 'kind',
            label: 'List',
            options: KINDS.map((entry) => ({ value: entry.kind, label: entry.title })),
          },
          { type: 'text', name: 'value', label: 'Value', required: true, maxLength: 40, hint: 'What products store, e.g. “Titanium”. Can’t be changed later.' },
        ] as FieldConfig[])
      : []),
    { type: 'text', name: 'label', label: 'Label', value: option?.label, required: true, maxLength: 40 },
    { type: 'color', name: 'hex', label: 'Swatch (optional)', value: option?.hex ?? '' },
    { type: 'number', name: 'displayOrder', label: 'Display order', value: String(option?.displayOrder ?? 99), required: true },
    { type: 'checkbox', name: 'isActive', label: 'Offered', checked: option?.isActive ?? true },
  ];
}

export default async function OptionsPage() {
  await requireAdmin();
  const [filters, materials, lenses] = await Promise.all([
    prisma.filterOption.findMany({ orderBy: [{ displayOrder: 'asc' }, { value: 'asc' }] }),
    prisma.frameMaterialInfo.findMany({ orderBy: { material: 'asc' } }),
    prisma.lensOptionInfo.findMany({ orderBy: { lensOption: 'asc' } }),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Catalog options</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The lists products choose from, and the text the product page shows for each material and lens. Removing a value
          only stops it being offered: products that already use it keep it.
        </p>
      </div>

      <section aria-labelledby="lists-title" className="flex flex-col gap-4">
        <h2 id="lists-title" className="text-sm font-bold uppercase tracking-wide">Filter lists</h2>
        {KINDS.map(({ kind, title, note }) => (
          <div key={kind} className="rounded-xl border border-border bg-background p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            <ul className="mt-3 flex flex-col gap-3">
              {filters.filter((option) => option.kind === kind).map((option) => (
                <li key={option.value} className="flex flex-wrap items-start gap-3">
                  <details className="min-w-0 flex-1">
                    <summary className="cursor-pointer text-sm">
                      {option.hex && <span aria-hidden="true" className="mr-2 inline-block size-3 rounded-full border border-border align-middle" style={{ background: option.hex }} />}
                      <span className="font-medium">{option.label}</span> <span className="text-xs text-muted-foreground">({option.value}) · #{option.displayOrder} · Edit</span>
                      {!option.isActive && <Hidden />}
                    </summary>
                    <div className="mt-3 max-w-xl">
                      <ConfigForm action={updateFilterOption.bind(null, kind, option.value)} fields={filterFields(option)} submitLabel="Save" />
                    </div>
                  </details>
                  <ConfirmSubmitButton action={deleteFilterOption.bind(null, kind, option.value)} label="Remove" danger message={`Remove “${option.label}” from this list? Products that use it keep it.`} />
                </li>
              ))}
              {filters.every((option) => option.kind !== kind) && <li className="text-sm text-muted-foreground">Nothing here yet.</li>}
            </ul>
          </div>
        ))}
        <details className="rounded-xl border border-border p-5">
          <summary className="cursor-pointer font-semibold">Add to a list</summary>
          <div className="mt-3 max-w-xl">
            <ConfigForm action={createFilterOption} fields={filterFields(undefined, true)} submitLabel="Add" />
          </div>
        </details>
      </section>

      <section aria-labelledby="materials-title" className="flex flex-col gap-4">
        <div>
          <h2 id="materials-title" className="text-sm font-bold uppercase tracking-wide">Frame material details</h2>
          <p className="mt-1 text-xs text-muted-foreground">Shown in the “Frame” section of a product page. The name must match the material in the list above.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {materials.map((material) => (
            <li key={material.material} className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-background p-4">
              <details className="min-w-0 flex-1">
                <summary className="cursor-pointer text-sm font-medium">{material.material}{!material.isActive && <Hidden />}</summary>
                <div className="mt-3 max-w-2xl">
                  <ConfigForm
                    action={updateFrameMaterial.bind(null, material.material)}
                    submitLabel="Save"
                    fields={[
                      { type: 'text', name: 'dimensions', label: 'Dimensions', value: material.dimensions, maxLength: 120, hint: 'Eye / bridge / temple, e.g. 48-54 mm / 16-18 mm / 135-140 mm' },
                      { type: 'text', name: 'weight', label: 'Weight', value: material.weight, maxLength: 60 },
                      { type: 'text', name: 'composition', label: 'Composition', value: material.composition, maxLength: 200, wide: true },
                      { type: 'textarea', name: 'performance', label: 'Performance', value: material.performance, maxLength: 500, wide: true },
                      { type: 'text', name: 'nosePad', label: 'Nose pad', value: material.nosePad, maxLength: 60 },
                      { type: 'checkbox', name: 'isHypoallergenic', label: 'Hypoallergenic', checked: material.isHypoallergenic },
                      { type: 'checkbox', name: 'isActive', label: 'Shown on product pages', checked: material.isActive },
                    ]}
                  />
                </div>
              </details>
              <ConfirmSubmitButton action={deleteFrameMaterial.bind(null, material.material)} label="Delete" danger message={`Delete the details for “${material.material}”?`} />
            </li>
          ))}
        </ul>
        <details className="rounded-xl border border-border p-5">
          <summary className="cursor-pointer font-semibold">Add a material</summary>
          <div className="mt-3 max-w-2xl">
            <ConfigForm
              action={createFrameMaterial}
              submitLabel="Add material"
              fields={[
                { type: 'text', name: 'material', label: 'Name', required: true, maxLength: 40, wide: true },
                { type: 'text', name: 'dimensions', label: 'Dimensions', maxLength: 120 },
                { type: 'text', name: 'weight', label: 'Weight', maxLength: 60 },
                { type: 'text', name: 'composition', label: 'Composition', maxLength: 200, wide: true },
                { type: 'textarea', name: 'performance', label: 'Performance', maxLength: 500, wide: true },
                { type: 'text', name: 'nosePad', label: 'Nose pad', maxLength: 60 },
                { type: 'checkbox', name: 'isHypoallergenic', label: 'Hypoallergenic', checked: false },
                { type: 'checkbox', name: 'isActive', label: 'Shown on product pages', checked: true },
              ]}
            />
          </div>
        </details>
      </section>

      <section aria-labelledby="lens-title" className="flex flex-col gap-4">
        <div>
          <h2 id="lens-title" className="text-sm font-bold uppercase tracking-wide">Lens option details</h2>
          <p className="mt-1 text-xs text-muted-foreground">Shown in the “Lens” section of a product page. The name must match the option in the list above.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {lenses.map((lens) => (
            <li key={lens.lensOption} className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-background p-4">
              <details className="min-w-0 flex-1">
                <summary className="cursor-pointer text-sm font-medium">{lens.lensOption}{!lens.isActive && <Hidden />}</summary>
                <div className="mt-3 max-w-2xl">
                  <ConfigForm
                    action={updateLensOption.bind(null, lens.lensOption)}
                    submitLabel="Save"
                    fields={[
                      { type: 'textarea', name: 'description', label: 'Description', value: lens.description, maxLength: 800, wide: true },
                      { type: 'text', name: 'metric', label: 'Performance metric (optional)', value: lens.metric ?? '', maxLength: 120, wide: true },
                      { type: 'number', name: 'upgradeMinPrice', label: 'Upgrade price from (₱)', value: lens.upgradeMinPrice === null ? '' : String(lens.upgradeMinPrice) },
                      { type: 'number', name: 'upgradeMaxPrice', label: 'Upgrade price to (₱)', value: lens.upgradeMaxPrice === null ? '' : String(lens.upgradeMaxPrice) },
                      { type: 'checkbox', name: 'isActive', label: 'Shown on product pages', checked: lens.isActive },
                    ]}
                  />
                </div>
              </details>
              <ConfirmSubmitButton action={deleteLensOption.bind(null, lens.lensOption)} label="Delete" danger message={`Delete the details for “${lens.lensOption}”?`} />
            </li>
          ))}
        </ul>
        <details className="rounded-xl border border-border p-5">
          <summary className="cursor-pointer font-semibold">Add a lens option</summary>
          <div className="mt-3 max-w-2xl">
            <ConfigForm
              action={createLensOption}
              submitLabel="Add lens option"
              fields={[
                { type: 'text', name: 'lensOption', label: 'Name', required: true, maxLength: 40, wide: true },
                { type: 'textarea', name: 'description', label: 'Description', maxLength: 800, wide: true },
                { type: 'text', name: 'metric', label: 'Performance metric (optional)', maxLength: 120, wide: true },
                { type: 'number', name: 'upgradeMinPrice', label: 'Upgrade price from (₱)' },
                { type: 'number', name: 'upgradeMaxPrice', label: 'Upgrade price to (₱)' },
                { type: 'checkbox', name: 'isActive', label: 'Shown on product pages', checked: true },
              ]}
            />
          </div>
        </details>
      </section>
    </div>
  );
}
