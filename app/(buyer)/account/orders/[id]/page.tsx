import { notFound } from 'next/navigation';
import AccountHeader from '@/component/account/AccountHeader';
import Panel from '@/component/account/Panel';
import CancelOrderButton from '@/component/order/CancelOrderButton';
import OrderStatusBadge from '@/component/order/OrderStatusBadge';
import OrderStatusSteps from '@/component/order/OrderStatusSteps';
import OrderSummaryCard from '@/component/order/OrderSummaryCard';
import ShippingInfoCard from '@/component/order/ShippingInfoCard';
import { requireUser } from '@/lib/auth/session';
import { formatOrderNumber } from '@/lib/format';
import { getOrderForUser } from '@/lib/orders/queries';
import { cancelBlockedReason, canCancel } from '@/lib/orders/rules';
import { orderBucket } from '@/lib/orders/tabs';
import { cancelMyOrder } from '../actions';

export default async function OrderDetailPage(props: PageProps<'/account/orders/[id]'>) {
  const { id } = await props.params;
  const user = await requireUser(`/account/orders/${id}`);

  // Scoped to the signed-in user, so someone else's order id is just a 404.
  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AccountHeader
        eyebrow="Order"
        title={formatOrderNumber(order.number)}
        back={{ href: '/account/orders', label: 'Order history' }}
        description={
          order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED'
            ? "Payment pending — we'll start processing once it's received."
            : undefined
        }
      >
        <OrderStatusBadge bucket={orderBucket(order)} />
      </AccountHeader>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Panel title="Progress" index="01" className="py-8">
            <OrderStatusSteps status={order.status} variant="storefront" />
          </Panel>
          <ShippingInfoCard order={order} variant="storefront" />
          {canCancel(order) ? (
            <CancelOrderButton action={cancelMyOrder.bind(null, order.id)} orderLabel={formatOrderNumber(order.number)} />
          ) : (
            cancelBlockedReason(order) && <p className="text-sm text-muted-foreground">{cancelBlockedReason(order)}</p>
          )}
        </div>
        <OrderSummaryCard order={order} />
      </div>
    </div>
  );
}
