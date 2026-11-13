// Plain text hygiene with no dependencies. Kept apart from text.ts (which builds Zod schemas)
// so client components that run on every page, like the header search, can import it without
// shipping Zod to the browser. No 'use client'/'server-only' on purpose: server and browser share it.
//
// React already escapes text when it renders, and the emails escape too, so stored text is not an
// exploit by itself. This is the second wall: markup never gets stored, so a future print view, PDF,
// export or raw-HTML sink can't inherit it.

// Longest search text we look at. Shared by the page, the suggestions route and the input.
export const SEARCH_QUERY_MAX = 80;

export const NO_MARKUP_MESSAGE = 'Remove < and > characters';

// Single-line text: Unicode NFC, any run of whitespace (tabs and newlines too) becomes one space,
// and control or invisible format characters (zero-width, bidi overrides, byte-order mark) are
// dropped. Invisible characters are the usual way to make look-alike text or hide a payload.
export function cleanText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tag delimiters are the one thing no address, city, label or promo code needs. Everything else
// (# , . - / ' & and so on) stays valid.
export function hasMarkup(value: string): boolean {
  return /[<>]/.test(value);
}

export const noMarkup = (value: string) => !hasMarkup(value);
