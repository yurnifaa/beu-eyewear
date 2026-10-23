import 'server-only';

import { createSign } from 'node:crypto';
import { sheetsApiConfig, type SheetsApiConfig } from './config';

// Authenticated Google Sheets access through a service account, using only Node's
// crypto and fetch (no SDK). The key lives in the environment and never leaves this
// file; failures are reported by HTTP status only.

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TIMEOUT_MS = 10_000;

export class SheetsApiError extends Error {
  constructor(
    readonly action: string,
    readonly status?: number,
  ) {
    super(`Sheets API ${action} failed${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'SheetsApiError';
  }
}

let token: { value: string; expiresAt: number } | undefined;
let pendingToken: Promise<string> | undefined;

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function signAssertion(config: SheetsApiConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({ iss: config.clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${base64url(signer.sign(config.privateKey))}`;
}

async function accessToken(config: SheetsApiConfig): Promise<string> {
  if (token && token.expiresAt - 60_000 > Date.now()) return token.value;
  if (pendingToken) return pendingToken;

  pendingToken = (async () => {
    let response: Response;
    try {
      response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signAssertion(config),
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new SheetsApiError('authentication');
    }
    if (!response.ok) throw new SheetsApiError('authentication', response.status);
    const body = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!body.access_token) throw new SheetsApiError('authentication');
    token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
    return token.value;
  })().finally(() => {
    pendingToken = undefined;
  });
  return pendingToken;
}

async function call(action: string, path: string, init: RequestInit = {}) {
  const config = sheetsApiConfig();
  if (!config) throw new SheetsApiError(`${action} (service account not configured)`);

  let response: Response;
  try {
    response = await fetch(`${SHEETS_BASE}/${config.spreadsheetId}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${await accessToken(config)}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof SheetsApiError) throw error;
    throw new SheetsApiError(action);
  }
  if (!response.ok) {
    // An expired or revoked token shows up as 401: drop it so the next call re-authenticates.
    if (response.status === 401) token = undefined;
    throw new SheetsApiError(action, response.status);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

export type SheetCell = string | number | boolean | null;

// Values as the sheet calculated them, with numbers as numbers (not "1,250").
export async function readSheetRange(range: string): Promise<SheetCell[][]> {
  const query = new URLSearchParams({ valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'FORMATTED_STRING' });
  const body = await call('read', `/values/${encodeURIComponent(range)}?${query}`);
  return (body.values as SheetCell[][] | undefined) ?? [];
}

// Names of the tabs that exist in the spreadsheet.
export async function readSheetTitles(): Promise<string[]> {
  const query = new URLSearchParams({ fields: 'sheets.properties.title' });
  const body = (await call('read tab names', `?${query}`)) as { sheets?: { properties?: { title?: string } }[] };
  return (body.sheets ?? []).map((sheet) => sheet.properties?.title).filter((title): title is string => Boolean(title));
}

// Several whole tabs in one request, as the text the sheet displays (same as a published CSV).
export async function readSheetTabs(tabs: string[]): Promise<Map<string, SheetCell[][]>> {
  const query = new URLSearchParams({ valueRenderOption: 'FORMATTED_VALUE' });
  for (const tab of tabs) query.append('ranges', tab);
  const body = (await call('read tabs', `/values:batchGet?${query}`)) as { valueRanges?: { values?: SheetCell[][] }[] };
  return new Map(tabs.map((tab, index) => [tab, body.valueRanges?.[index]?.values ?? []]));
}

// A leading = + - @ would make Sheets treat text as a formula.
function neutralize(cell: SheetCell): SheetCell {
  return typeof cell === 'string' && /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
}

export async function appendSheetRows(tab: string, rows: SheetCell[][]): Promise<void> {
  if (rows.length === 0) return;
  const query = new URLSearchParams({ valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS' });
  await call('append', `/values/${encodeURIComponent(`${tab}!A:A`)}:append?${query}`, {
    method: 'POST',
    body: JSON.stringify({ values: rows.map((row) => row.map(neutralize)) }),
  });
}
