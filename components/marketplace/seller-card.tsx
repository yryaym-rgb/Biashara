import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/dates';
import type { ListingSellerProfile } from '@/lib/marketplace/queries';

export interface SellerCardProps {
  seller: ListingSellerProfile | null;
  locale: string;
}

export async function SellerCard({ seller, locale }: SellerCardProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace.detail' });

  if (!seller) {
    return null;
  }

  const companyName = seller.company_name ?? t('seller');
  const memberSince = formatDate(seller.created_at, locale);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <h3 className="text-[18px] font-semibold text-ink">{t('seller')}</h3>
        <p className="text-base font-semibold text-ink">{companyName}</p>
        <p className="text-[13px] text-muted">{t('memberSince', { date: memberSince })}</p>
        {seller.kyc_status === 'approved' ? (
          <Badge variant="success">{t('kycVerified')}</Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
