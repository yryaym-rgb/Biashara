import { setRequestLocale } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { OrdersPageContent } from '@/components/platform/orders-page-content';
import { getOrdersForUser } from '@/lib/platform/orders';

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
  const { orders, total, pageSize } = await getOrdersForUser(profile.id, page);

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
