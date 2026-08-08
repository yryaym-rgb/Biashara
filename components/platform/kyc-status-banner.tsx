import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database.types';
import { getKycBannerTone } from '@/lib/platform/dashboard';
import { cn } from '@/lib/utils/cn';

type KycStatus = Database['public']['Enums']['kyc_status'];
type KycDocumentType = Database['public']['Enums']['kyc_document_type'];

export interface KycStatusBannerProps {
  locale: string;
  kycStatus: KycStatus;
  rejectedDocumentTypes: KycDocumentType[];
}

const toneStyles = {
  info: 'border-brand-blue bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--bg))]',
  warning: 'border-brand-gold bg-[color-mix(in_srgb,var(--brand-gold)_10%,var(--bg))]',
  neutral: 'border-border bg-bg-tint',
} as const;

export async function KycStatusBanner({
  locale,
  kycStatus,
  rejectedDocumentTypes,
}: KycStatusBannerProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.kycBanner' });
  const tKyc = await getTranslations({ locale, namespace: 'kyc' });
  const tone = getKycBannerTone(kycStatus);

  const messageKey =
    kycStatus === 'pending'
      ? 'pending'
      : kycStatus === 'rejected'
        ? 'rejected'
        : 'none';

  return (
    <Card className={cn('border', toneStyles[tone])}>
      <CardContent className="space-y-4 p-6">
        <p className="text-[15px] text-body">{t(messageKey)}</p>

        {kycStatus === 'rejected' && rejectedDocumentTypes.length > 0 ? (
          <ul className="space-y-2">
            {rejectedDocumentTypes.map((docType) => (
              <li key={docType} className="text-[13px] font-semibold text-ink">
                {tKyc(docType)}
              </li>
            ))}
          </ul>
        ) : null}

        <div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/settings">{t('cta')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
