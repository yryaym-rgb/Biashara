import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';

export interface LotTraceabilityBadgeProps {
  lotId: string;
  lotCode: string;
  locale: string;
}

export async function LotTraceabilityBadge({
  lotId,
  lotCode,
  locale,
}: LotTraceabilityBadgeProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace.traceability' });

  return (
    <Link href={`/lots/${lotId}`} className="inline-flex">
      <Badge variant="info">
        {t('badge', { code: lotCode })}
      </Badge>
    </Link>
  );
}
