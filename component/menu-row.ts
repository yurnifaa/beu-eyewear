// Look of one row in the mobile menu (links, the Account link and the Log in button).
export const menuRowClass = (active: boolean) =>
  `flex items-center gap-3 rounded-full px-4 py-3.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-150 focus-visible:outline-2 ${
    active ? 'bg-ice shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]' : 'hover:bg-accent/15'
  }`;
