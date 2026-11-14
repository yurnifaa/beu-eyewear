// Shop sort choices, shared by the listing page (reads the address bar), the catalog query (does
// the sorting) and the sort menus. Pure on purpose — no server imports — so client components can
// use it too.
//
// The address bar value is "<field>-<direction>", e.g. `sort=price-asc`. No `sort` means the shop's
// own order (the Featured entry in the menu).

export const SORT_FIELDS = ['name', 'date', 'price'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];
export type ProductSort = `${SortField}-${SortDirection}`;

const FIELD_LABELS: Record<SortField, string> = { name: 'Name', date: 'Date', price: 'Price' };
const DIRECTION_LABELS: Record<SortDirection, string> = { asc: 'Ascending', desc: 'Descending' };
const DIRECTION_SHORT_LABELS: Record<SortDirection, string> = { asc: 'Asc', desc: 'Desc' };

export function splitSort(sort: ProductSort): { field: SortField; direction: SortDirection } {
  const [field, direction] = sort.split('-') as [SortField, SortDirection];
  return { field, direction };
}

// The value comes from the address bar, so check it instead of trusting a cast: anything that is
// not one of the six known choices is ignored.
export function parseSort(value: string | undefined): ProductSort | undefined {
  if (!value) return undefined;
  const [field, direction, ...rest] = value.split('-');
  if (rest.length > 0) return undefined;
  if (!SORT_FIELDS.includes(field as SortField) || !SORT_DIRECTIONS.includes(direction as SortDirection)) return undefined;
  return value as ProductSort;
}

export interface SortMenuOption {
  label: string;
  href: string;
  active: boolean;
}

export interface SortMenuGroup {
  field: SortField;
  label: string;
  options: SortMenuOption[];
}

export interface SortMenuData {
  // The shop's own order. Picking it clears the sort.
  reset: SortMenuOption;
  groups: SortMenuGroup[];
  // What the closed button says: "Sort" until something is picked, then e.g. "Price: Ascending".
  buttonLabel: string;
  // Same, short enough for the phone filter bar.
  shortButtonLabel: string;
}

// `hrefFor(undefined)` must give the link that clears the sort.
export function buildSortMenu(active: ProductSort | undefined, hrefFor: (sort: ProductSort | undefined) => string): SortMenuData {
  const current = active ? splitSort(active) : undefined;
  return {
    reset: { label: 'Featured', href: hrefFor(undefined), active: !active },
    groups: SORT_FIELDS.map((field) => ({
      field,
      label: FIELD_LABELS[field],
      options: SORT_DIRECTIONS.map((direction) => ({
        label: DIRECTION_LABELS[direction],
        href: hrefFor(`${field}-${direction}`),
        active: current?.field === field && current.direction === direction,
      })),
    })),
    buttonLabel: current ? `${FIELD_LABELS[current.field]}: ${DIRECTION_LABELS[current.direction]}` : 'Sort',
    shortButtonLabel: current ? `${FIELD_LABELS[current.field]}: ${DIRECTION_SHORT_LABELS[current.direction]}` : 'Sort',
  };
}
