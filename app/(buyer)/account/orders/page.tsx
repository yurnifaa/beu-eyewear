import EmptyOrders from '@/component/order/EmptyOrders';
import OrderCard from '@/component/order/OrderCard';
import OrderTabs from '@/component/order/OrderTabs';
import { requireUser } from '@/lib/auth/session';
import { getOrdersForUser } from '@/lib/orders/queries';
import { inTab, ORDER_TABS, orderBucket, parseTab, type OrderTabId } from '@/lib/orders/tabs';

export default async function OrdersPage(props: PageProps<'/account/orders'>) {
  const { tab: tabParam } = await props.searchParams;
  const tab = parseTab(tabParam);

  // Checked here rather than in account/layout.tsx so /account/wishlist
  // (localStorage-backed) stays usable without signing in.
  const user = await requireUser(tab === 'all' ? '/account/orders' : `/account/orders?tab=${tab}`);
  const orders = await getOrdersForUser(user.id);

  const withBucket = orders.map((order) => ({ order, bucket: orderBucket(order) }));
  const counts = Object.fromEntries(
    ORDER_TABS.map(({ id }) => [id, withBucket.filter((entry) => inTab(entry.bucket, id)).length]),
  ) as Record<OrderTabId, number>;
  const visible = withBucket.filter((entry) => inTab(entry.bucket, tab));
  const activeTab = ORDER_TABS.find((candidate) => candidate.id === tab)!;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Order History</h1>

      <OrderTabs active={tab} counts={counts} />

      {visible.length === 0 ? (
        <EmptyOrders message={activeTab.empty} />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map(({ order, bucket }) => (
            <OrderCard key={order.id} order={order} bucket={bucket} />
          ))}
        </div>
      )}
    </div>
  );
}
