import 'server-only';

// Everything that points at the Google Sheet is read here, on the server, from
// environment variables WITHOUT the NEXT_PUBLIC_ prefix. Nothing in this module
// (or its callers) returns a URL, spreadsheet id or key to a component, a route
// response, a log line or an error message: errors name the env var, never its value.

export const SHEET_TABS = [
  'store_settings',
  'lookups',
  'categories',
  'subcategories',
  'products',
  'product_variants',
  'inventory',
  'bundle_items',
  'reviews',
  'frame_materials',
  'lens_options',
  'shipping_methods',
  'discounts',
] as const;

export type SheetTab = (typeof SHEET_TABS)[number];

// The storefront can't render without these; every other tab degrades gracefully.
export const REQUIRED_TABS: readonly SheetTab[] = ['categories', 'subcategories', 'products', 'product_variants'];

export class SheetConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetConfigError';
  }
}

export function csvEnvName(tab: SheetTab) {
  return `CATALOG_CSV_${tab.toUpperCase()}`;
}

// Hosts a published-CSV request may talk to, including the redirect Google
// issues to its content host. Anything else is refused, so a bad env value
// can't turn this server into an open proxy.
const ALLOWED_HOSTS = [/^docs\.google\.com$/, /^[a-z0-9-]+\.googleusercontent\.com$/];

export function isAllowedHost(hostname: string) {
  return ALLOWED_HOSTS.some((pattern) => pattern.test(hostname));
}

function parsePublishedUrl(name: string, raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SheetConfigError(`${name} is not a valid URL.`);
  }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !url.pathname.startsWith('/spreadsheets/d/')) {
    throw new SheetConfigError(`${name} must be a "Publish to web" link on docs.google.com.`);
  }
  if (url.username || url.password) {
    throw new SheetConfigError(`${name} must not contain credentials.`);
  }
  return url;
}

export function publishedCsvUrl(tab: SheetTab): URL | undefined {
  const name = csvEnvName(tab);
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  return parsePublishedUrl(name, raw);
}

export function isTabConfigured(tab: SheetTab) {
  return isStockWriteEnabled() || Boolean(process.env[csvEnvName(tab)]?.trim());
}

function seconds(name: string, fallback: number, min: number, max: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

// How long a fetched tab is reused before asking Google again.
export function catalogCacheMs() {
  return seconds('CATALOG_CACHE_SECONDS', 60, 5, 3600) * 1000;
}

// Stock is read through the authenticated API and kept much fresher.
export function stockCacheMs() {
  return seconds('STOCK_CACHE_SECONDS', 15, 2, 600) * 1000;
}

export interface SheetsApiConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

// Present only when the service account has been set up. Without it the
// storefront still works, but stock is read-only (from the published CSV) and
// orders are not written back to the sheet.
export function sheetsApiConfig(): SheetsApiConfig | undefined {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!spreadsheetId && !clientEmail && !rawKey) return undefined;
  if (!spreadsheetId || !clientEmail || !rawKey) {
    throw new SheetConfigError(
      'GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must all be set together.',
    );
  }
  if (!/^[A-Za-z0-9_-]{20,}$/.test(spreadsheetId)) {
    throw new SheetConfigError('GOOGLE_SHEETS_SPREADSHEET_ID looks malformed (use the id between /d/ and /edit in the sheet URL).');
  }
  if (!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(clientEmail)) {
    throw new SheetConfigError('GOOGLE_SERVICE_ACCOUNT_EMAIL must be a service account address ending in .iam.gserviceaccount.com.');
  }
  // .env files often hold the key on one line with literal \n sequences.
  const privateKey = rawKey.replace(/\\n/g, '\n').trim();
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new SheetConfigError('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must be the "private_key" value from the service account JSON.');
  }
  return { spreadsheetId, clientEmail, privateKey };
}

export function isStockWriteEnabled() {
  try {
    return Boolean(sheetsApiConfig());
  } catch {
    return false;
  }
}
