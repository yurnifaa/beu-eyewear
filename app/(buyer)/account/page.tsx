import Link from 'next/link';
import { Heart, MapPin, Package } from 'lucide-react';

const MOCK_USER = {
  name: 'Jana Del Rosario',
  email: 'jana.delrosario@example.com',
  memberSince: '2025',
};

const QUICK_LINKS = [
  { href: '/account/orders', label: 'Orders', description: 'Track and review past purchases', icon: Package },
  { href: '/account/addresses', label: 'Addresses', description: 'Manage your shipping addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', description: 'Products you have saved', icon: Heart },
] as const;

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Account Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preview profile — sign-in isn&apos;t wired up yet.</p>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <p className="text-lg font-bold">{MOCK_USER.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{MOCK_USER.email}</p>
        <p className="mt-1 text-xs text-muted-foreground">Member since {MOCK_USER.memberSince}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-2xl border border-border p-5 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md"
          >
            <Icon size={20} />
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
