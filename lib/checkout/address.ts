// Shared by the checkout form (input limits) and the zod schema (authoritative
// check). No 'use client'/'server-only' on purpose so both sides can import it.
export const ADDRESS_LIMITS = {
  fullName: 100,
  address: 255,
  city: 50,
  province: 50,
  zip: 4,
  phone: 11,
} as const;

// The shipping address fields, as the checkout form prefills them.
export interface AddressFields {
  fullName: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

// For typing/pasting into an input: keep digits and cut off at `max`.
export function digitsOnly(value: string, max: number): string {
  return value.replace(/\D/g, '').slice(0, max);
}

// Philippine mobiles are stored as 11 digits starting with 09. The form shows a fixed
// "+63" and asks for the 10 digits after it (9171234567), so the stored form is rebuilt
// here. A pasted international form (+63 917 123 4567 -> 639171234567) is converted
// rather than rejected.
//
// Deliberately does NOT truncate: the server validates the result, so an
// over-long number must fail rather than be silently cut to 11 digits. The
// input handler truncates separately.
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (/^63\d{10}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  return digits;
}

// Digits after the fixed "+63" shown in the mobile field. Accepts the stored form
// (09171234567), a pasted +63 number or what was already typed (9171234567).
export const PHONE_LOCAL_LENGTH = 10;

export function phoneInputValue(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (/^63\d{10}$/.test(digits)) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, PHONE_LOCAL_LENGTH);
}

// Names: letters (including ñ), digits, spaces and - ' . only. Typographic
// apostrophes are converted rather than dropped.
export const NAME_PATTERN = /^[A-Za-z0-9ñÑ '.-]+$/;
export const NAME_RULE_MESSAGE = "Use only letters, numbers, spaces, - ' and . in names";

export function sanitizeName(value: string, max: number): string {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[^A-Za-z0-9ñÑ '.-]/g, '')
    .slice(0, max);
}

// How many addresses one account can keep in the address book.
export const MAX_SAVED_ADDRESSES = 5;

// Optional nickname such as "Home" or "Office".
export const ADDRESS_LABEL_MAX = 30;
