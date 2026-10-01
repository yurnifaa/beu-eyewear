import Link from 'next/link';
import { Package } from 'lucide-react';
import { buttonClassName } from '@/component/Button';

export default function EmptyOrders({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Package size={24} />
      </span>
      <h2 className="mt-4 text-lg font-bold">No Orders Yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Link href="/listing" className={buttonClassName({ variant: 'primary', className: 'mt-6 uppercase' })}>
        Start Shopping
      </Link>
    </div>
  );
}
