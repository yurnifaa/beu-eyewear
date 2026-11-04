import Link from 'next/link';
import { ArrowRight, BadgeCheck, MailWarning } from 'lucide-react';
import PixelGlyph, { type GlyphName } from '@/component/beu/PixelGlyph';
import AccountHeader from '@/component/account/AccountHeader';
import Panel from '@/component/account/Panel';
import WishlistCount from '@/component/account/WishlistCount';
import OrderStatusBadge from '@/component/order/OrderStatusBadge';
import { logout } from '@/lib/auth/actions';
import { requireUser } from '@/lib/auth/session';
import { MAX_SAVED_ADDRESSES } from '@/lib/checkout/address';
import { getSavedAddresses } from '@/lib/checkout/saved-address';
import { formatOrderNumber, formatPrice } from '@/lib/format';
import { getOrdersForUser } from '@/lib/orders/queries';
import { orderBucket } from '@/lib/orders/tabs';

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default async function AccountPage() {
  // Checked here rather than in account/layout.tsx so /account/wishlist
  // (localStorage-backed) stays usable without signing in.
  const user = await requireUser('/account');
  const [orders, addresses] = await Promise.all([getOrdersForUser(user.id), getSavedAddresses(user.id)]);

  const inProgress = orders.filter((order) => {
    const bucket = orderBucket(order);
    return bucket !== 'completed' && bucket !== 'cancelled';
  }).length;
  const latest = orders[0];
  const verified = Boolean(user.emailVerifiedAt);
  const firstName = user.name.split(/\s+/)[0] || user.name;

  const tiles: { href: string; label: string; description: string; glyph: GlyphName; stat: React.ReactNode }[] = [
    {
      href: '/account/profile',
      label: 'Profile',
      description: 'Edit details, verify your email, change your password.',
      glyph: 'spark',
      stat: verified ? 'Email verified' : 'Verify email',
    },
    {
      href: '/account/orders',
      label: 'Orders',
      description: 'Track and review past purchases.',
      glyph: 'bolt',
      stat: orders.length === 0 ? 'No orders yet' : `${orders.length} total${inProgress > 0 ? ` · ${inProgress} in progress` : ''}`,
    },
    {
      href: '/account/addresses',
      label: 'Addresses',
      description: 'Manage where your frames get shipped.',
      glyph: 'cross',
      stat: `${addresses.length} / ${MAX_SAVED_ADDRESSES} saved`,
    },
    {
      href: '/account/wishlist',
      label: 'Wishlist',
      description: 'Products you saved with the heart icon.',
      glyph: 'heart',
      stat: <WishlistCount />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader eyebrow="Account overview" title={`Hey, ${firstName}.`} description="Everything about your BeU account, in one place.">
        <form action={logout}>
          <button type="submit" className="beu-chip inline-flex h-11 items-center px-6 text-xs uppercase tracking-[0.12em]">
            Sign out
          </button>
        </form>
      </AccountHeader>

      <Panel className="flex flex-wrap items-center gap-5">
        <span
          aria-hidden="true"
          className="beu-gloss grid size-16 shrink-0 place-items-center rounded-full font-display text-xl font-black tracking-[-0.03em]"
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-black uppercase tracking-[-0.02em]">{user.name}</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
        </div>
        <span className="beu-chip inline-flex h-9 items-center gap-2 px-4 text-[11px] uppercase tracking-[0.14em]">
          {verified ? <BadgeCheck size={14} aria-hidden="true" /> : <MailWarning size={14} aria-hidden="true" />}
          {verified ? 'Verified' : 'Not verified'}
        </span>
      </Panel>

      {!verified && (
        <Link
          href="/account/profile"
          className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm transition-colors hover:bg-accent/15"
        >
          <MailWarning size={18} aria-hidden="true" className="shrink-0 text-accent" />
          <span className="flex-1">Your email isn&apos;t verified yet. Verify it so you can recover your account.</span>
          <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {tiles.map(({ href, label, description, glyph, stat }, i) => (
          <Link
            key={href}
            href={href}
            className="group relative flex min-h-48 flex-col overflow-hidden rounded-3xl border border-border bg-background/80 p-6 backdrop-blur transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(40,100,180,0.18)]"
          >
            <PixelGlyph name={glyph} size={84} className="absolute right-5 top-5 text-accent opacity-15 transition-opacity group-hover:opacity-30" />
            <span className="text-[11px] tracking-[0.18em] text-muted-foreground">[ 0{i + 1} ]</span>
            <p className="mt-4 font-display text-2xl font-black uppercase tracking-[-0.03em]">{label}</p>
            <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-muted-foreground">{description}</p>
            <div className="relative mt-auto flex items-end justify-between gap-3 pt-6">
              <span className="beu-chip inline-flex h-8 items-center px-3.5 text-[10px] uppercase tracking-[0.14em]">{stat}</span>
              <span className="beu-gloss grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {latest && (
        <Panel title="Latest order" index="05">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-black uppercase tracking-[-0.02em]">{formatOrderNumber(latest.number)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {latest.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })}
                {' · '}
                {formatPrice(latest.total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge bucket={orderBucket(latest)} />
              <Link href={`/account/orders/${latest.id}`} className="beu-chip inline-flex h-10 items-center gap-2 px-5 text-[11px] uppercase tracking-[0.12em]">
                View order
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
