import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { orderStatusVariant } from '@/lib/admin/display';
import { formatCurrency } from '@/lib/utils/format';
import type { Database } from '@/types/database.types';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  requireAuth(await getProfile());
  const t = await getTranslations({ locale, namespace: 'platform.orders' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
        id,
        status,
        price_amount,
        quantity,
        currency,
        created_at,
        listing:listings(title, mineral)
      `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!order) {
    notFound();
  }

  const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
  const amount = Number(order.price_amount) * Number(order.quantity);
  const status = order.status as Database['public']['Enums']['order_status'];
  const statusLabel =
    status === 'in_transit' ? t('inTransit') : t(status as 'confirmed');

  return (
    <Container>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{listing?.title ?? t('title')}</CardTitle>
            <Badge variant={orderStatusVariant(status)}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-[15px] text-body">
          {listing?.mineral ? (
            <p>
              {tMinerals(listing.mineral)}
            </p>
          ) : null}
          <p className="tabular-nums font-semibold text-ink">
            {formatCurrency(amount, order.currency, locale)}
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
