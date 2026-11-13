// Where to send someone after sign-in. No 'server-only' on purpose so it can be unit tested.
//
// Only same-origin paths are allowed. The old check only rejected a leading "//" and "/\", but
// browsers delete tabs and newlines when they parse a URL, so "/<TAB>/evil.com" slipped through and
// became "//evil.com". So: no control characters or backslashes anywhere, and the value must still
// resolve to our own origin when parsed the way a browser would.
const PLACEHOLDER_ORIGIN = 'http://beu.invalid';
const MAX_LENGTH = 512;

export function safeNextPath(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string' || value.length > MAX_LENGTH) return fallback;
  if (!value.startsWith('/') || /[\p{Cc}\\]/u.test(value)) return fallback;

  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
