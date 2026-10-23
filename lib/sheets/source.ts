import 'server-only';

import { cached } from './cache';
import { SHEET_TABS, SheetConfigError, catalogCacheMs, isAllowedHost, isStockWriteEnabled, publishedCsvUrl, type SheetTab } from './config';
import { parseCsv, type CsvRecord } from './csv';
import { readSheetTabs, readSheetTitles, type SheetCell } from './google-api';

const TIMEOUT_MS = 8_000;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

// What callers (and therefore pages and logs) get to see. It carries the tab name and
// an HTTP status at most: never the URL, which is the secret.
export class CatalogSourceError extends Error {
  constructor(
    readonly tab: SheetTab,
    reason: string,
  ) {
    super(`Catalog source unavailable (${tab}: ${reason})`);
    this.name = 'CatalogSourceError';
  }
}

async function fetchCsvText(tab: SheetTab, start: URL): Promise<string> {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let response: Response;
    try {
      // Redirects are followed by hand so every hop can be checked against the allowlist.
      response = await fetch(url, {
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { Accept: 'text/csv' },
      });
    } catch {
      throw new CatalogSourceError(tab, 'network error or timeout');
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new CatalogSourceError(tab, 'redirect without location');
      const next = new URL(location, url);
      if (next.protocol !== 'https:' || !isAllowedHost(next.hostname)) {
        throw new CatalogSourceError(tab, 'redirect to a disallowed host');
      }
      url = next;
      continue;
    }

    if (!response.ok) throw new CatalogSourceError(tab, `HTTP ${response.status}`);

    const type = response.headers.get('content-type') ?? '';
    // A sheet that isn't published (or isn't shared) answers with an HTML sign-in page.
    if (type.includes('text/html')) throw new CatalogSourceError(tab, 'not published as CSV');
    const declared = Number(response.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > MAX_BYTES) throw new CatalogSourceError(tab, 'response too large');

    const text = await response.text();
    if (text.length > MAX_BYTES) throw new CatalogSourceError(tab, 'response too large');
    return text;
  }
  throw new CatalogSourceError(tab, 'too many redirects');
}

function toRecords(values: SheetCell[][]): CsvRecord[] {
  const [header, ...body] = values;
  if (!header) return [];
  const names = header.map((cell) => String(cell ?? '').trim());
  const text = (cell: SheetCell | undefined) => (cell === null || cell === undefined ? '' : String(cell).trim());
  return body
    .filter((row) => row.some((cell) => text(cell) !== ''))
    .map((row) => Object.fromEntries(names.map((name, index) => [name, text(row[index])])));
}

// With the service account configured, every tab is read by name in one request (and the
// sheet doesn't have to be published to the web). One call fills the cache for all tabs.
function loadAllTabsViaApi() {
  return cached('api:tabs', catalogCacheMs(), async () => {
    const titles = new Set(await readSheetTitles());
    const present = SHEET_TABS.filter((tab) => titles.has(tab));
    const values = await readSheetTabs([...present]);
    return new Map(present.map((tab) => [tab, toRecords(values.get(tab) ?? [])]));
  });
}

async function loadTab(tab: SheetTab): Promise<CsvRecord[]> {
  if (isStockWriteEnabled()) {
    try {
      const rows = (await loadAllTabsViaApi()).get(tab);
      if (rows) return rows;
      throw new CatalogSourceError(tab, 'tab not found in the sheet');
    } catch (error) {
      // Fall back to a published link if one is configured; otherwise surface the problem.
      if (!publishedCsvUrl(tab)) throw error instanceof CatalogSourceError ? error : new CatalogSourceError(tab, 'Sheets API read failed');
      console.warn(`[catalog] Sheets API read failed for "${tab}", using the published link instead.`);
    }
  }

  const url = publishedCsvUrl(tab);
  if (!url) throw new SheetConfigError(`Set the Google service account variables or CATALOG_CSV_${tab.toUpperCase()}.`);
  return parseCsv(await fetchCsvText(tab, url));
}

// One tab as rows keyed by column header, reused for CATALOG_CACHE_SECONDS.
export function readTab(tab: SheetTab): Promise<CsvRecord[]> {
  return cached(`tab:${tab}`, catalogCacheMs(), () => loadTab(tab));
}
