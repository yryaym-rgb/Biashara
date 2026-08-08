import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { OrderDetailContent } from '@/components/platform/order-detail-content';
import { getOrderDetailForUser } from '@/lib/platform/orders';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const isAdmin = profile.role === 'admin';
  const order = await getOrderDetailForUser(id, profile.id, isAdmin);

  if (!order) {
    notFound();
  }

  return (
    <Container>
      <OrderDetailContent
        order={order}
        userId={profile.id}
        isAdmin={isAdmin}
        locale={locale}
      />
    </Container>
  );
}
