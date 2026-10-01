import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { buttonClassName } from '@/component/Button';
import OrderStatusSteps from '@/component/order/OrderStatusSteps';
import OrderSummaryCard from '@/component/order/OrderSummaryCard';
import ShippingInfoCard from '@/component/order/ShippingInfoCard';
import Reveal from '@/component/Reveal';
import { requireUser } from '@/lib/auth/session';
import { getOrderForUser } from '@/lib/orders/queries';

export default async function Page(props: PageProps<'/order-confirm/[id]'>) {
  const { id } = await props.params;
  const user = await requireUser(`/order-confirm/${id}`);

  // Scoped to the signed-in user, so someone else's order id is just a 404.
  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Link href="/home" className="flex items-center gap-2">
          <ChevronLeft size={20} />
          <span className="text-xl font-bold uppercase">Home</span>
        </Link>
      </Reveal>

      <Reveal mode="mount" className="grid grid-cols-1 gap-8 px-6 pt-8 pb-24 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold uppercase md:text-5xl">Thank You For Your Purchase!</h1>
          <p className="mt-4 text-muted-foreground">
            Your order has been received and will be processed within 24 hours during working days.
          </p>

          <OrderStatusSteps status={order.status} className="mt-16" />

          <ShippingInfoCard order={order} className="mt-10" />

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href={`/account/orders/${order.id}`}
              className={buttonClassName({ variant: 'primary', className: 'uppercase' })}
            >
              Track your Order
            </Link>
            <Link href="/listing" className="text-sm text-muted-foreground underline hover:text-foreground">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <OrderSummaryCard order={order} />
        </div>
      </Reveal>
    </>
  );
}
