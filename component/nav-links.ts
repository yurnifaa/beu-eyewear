// One source of truth for the storefront nav (desktop pill + mobile drawer).
// Edit hrefs here if your catalog uses different categories.
// `icon` is a plain string (not a component) so the list can be passed to the client-side mobile
// menu; the desktop nav ignores it. Keys are mapped to lucide icons in MobileMenu.
export type NavIcon = "home" | "shop" | "about";

export const NAV_LINKS: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/listing", label: "Shop", icon: "shop" },
  { href: "/about", label: "About", icon: "about" },
];
