import { Suspense } from "react";
import Link from "next/link";
import { User, Heart } from "lucide-react";
import MobileMenu from "@/component/MobileMenu";
import NavLogo from "@/component/NavLogo";
import CartPill from "@/component/CartPill";
import HeaderSearch from "@/component/HeaderSearch";
import HeaderNav from "@/component/HeaderNav";
import HeaderIconLink from "@/component/HeaderIconLink";
import LoginMenuItem from "@/component/LoginMenuItem";
import LoginModalTrigger from "@/component/LoginModalTrigger";
import { menuRowClass } from "@/component/menu-row";
import WishlistBadge from "@/component/WishlistBadge";
import { NAV_LINKS } from "@/component/nav-links";
import { getCurrentUser } from "@/lib/auth/session";

// Signed in: user icon goes to /account. Signed out: opens the login modal. Reading the session is a
// database lookup, so it streams in behind Suspense (showing the login button, which is what most
// visitors see) instead of holding up the header and the page under it.
async function AccountButton() {
  const user = await getCurrentUser();
  if (!user) return <LoginModalTrigger />;

  return (
    // Desktop only: below lg the account lives in the burger menu (see AccountMenuItem).
    <HeaderIconLink href="/account" label="Account" excludePaths={["/account/wishlist"]} className="hidden lg:inline-flex">
      <User size={20} strokeWidth={1.75} />
    </HeaderIconLink>
  );
}

// The same choice as a row in the burger menu: Account when signed in, Log in when signed out.
async function AccountMenuItem() {
  const user = await getCurrentUser();
  if (!user) return <LoginMenuItem />;

  return (
    <Link href="/account" className={menuRowClass(false)}>
      <User size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      Account
    </Link>
  );
}

export default function Header() {
  return (
    // The wrapper is see-through and click-through; only the pill takes clicks.
    // Its height is --beu-header-h so the home hero can slide up behind it.
    <header className="pointer-events-none sticky top-0 z-50 px-3 py-3 md:px-14 md:py-4">
      {/* From xl the pill is a three-column grid, so the nav sits on its true centre; below that
          the side groups are too wide for it, and flex spacing is used instead. */}
      <div className="beu-header-pill pointer-events-auto mx-auto flex h-14 max-w-[1328px] items-center justify-between gap-2 rounded-full pl-2 pr-2 md:h-16 md:gap-4 md:pl-6 md:pr-3 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:pr-6">
        <div className="flex items-center gap-1">
          <MobileMenu
            links={NAV_LINKS}
            accountSlot={
              <Suspense fallback={<LoginMenuItem />}>
                <AccountMenuItem />
              </Suspense>
            }
          />
          <Link href="/home" aria-label="BeU Eyewear home" className="flex items-center">
            <NavLogo />
          </Link>
        </div>

        <HeaderNav />

        {/* xl:-mr-3 undoes the symmetric padding so the cart pill stays concentric with the curve. */}
        <div className="flex items-center justify-end gap-0.5 md:gap-1.5 xl:-mr-3">
          <HeaderSearch />
          <Suspense fallback={<LoginModalTrigger />}>
            <AccountButton />
          </Suspense>
          <HeaderIconLink href="/account/wishlist" label="Wishlist" className="relative">
            <Heart size={20} strokeWidth={1.75} />
            <WishlistBadge />
          </HeaderIconLink>
          <CartPill />
        </div>
      </div>
    </header>
  );
}
