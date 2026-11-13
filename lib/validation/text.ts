import { z } from 'zod';
import { NO_MARKUP_MESSAGE, cleanText, noMarkup } from './clean-text';

// Zod builders for free-text form fields. The plain helpers (cleanText, hasMarkup, the messages and
// SEARCH_QUERY_MAX) live in clean-text.ts so code that must not load Zod can use them. They are
// re-exported here so a schema file needs only one import.
export { NO_MARKUP_MESSAGE, SEARCH_QUERY_MAX, cleanText, hasMarkup, noMarkup } from './clean-text';

// A required, single-line text field: cleaned, 1..max characters, no `<` or `>`.
export function safeText({ required, label, max }: { required: string; label: string; max: number }) {
  return z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(1, required).max(max, `${label} must be ${max} characters or fewer`).refine(noMarkup, NO_MARKUP_MESSAGE));
}

// The same, but empty is allowed (nickname, promo code).
export function optionalSafeText({ label, max }: { label: string; max: number }) {
  return z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer`).refine(noMarkup, NO_MARKUP_MESSAGE));
}
