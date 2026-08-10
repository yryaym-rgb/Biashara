import { setRequestLocale } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { OrdersPageContent } from '@/components/platform/orders-page-content';
import { getOrdersForUser, ORDERS_PAGE_SIZE } from '@/lib/platform/orders';
import { safeQuery } from '@/lib/safe-query';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const { orders, total, pageSize } = await safeQuery(
    'orders/list',
    () => getOrdersForUser(profile.id, page),
    { orders: [], total: 0, page, pageSize: ORDERS_PAGE_SIZE },
  );

  return (
    <Container>
      <OrdersPageContent
        orders={orders}
        total={total}
        page={page}
        pageSize={pageSize}
        userId={profile.id}
        locale={locale}
      />
    </Container>
  );
}
