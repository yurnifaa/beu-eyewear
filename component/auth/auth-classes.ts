// Shared button recipes for the sign-in family of pages. Plain strings so both
// server and client components can import them.
const base =
  'inline-flex h-12 w-full items-center justify-center rounded-full text-xs uppercase tracking-[0.14em] transition duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

export const authPrimaryClass = `${base} bg-ink text-white`;

export const authSecondaryClass = `${base} beu-chip`;
