import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { roleVariant } from '@/lib/admin/display';
import { formatDate } from '@/lib/utils/dates';
import type { DirectoryEntry } from '@/lib/directory/queries';

export interface DirectoryRowProps {
  entry: DirectoryEntry;
  locale: string;
}

export async function DirectoryRow({ entry, locale }: DirectoryRowProps) {
  const t = await getTranslations({ locale, namespace: 'platform.directory' });
  const tRoles = await getTranslations({ locale, namespace: 'admin.roles' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tCountries = await getTranslations({ locale, namespace: 'platform.settings.countries' });

  const { profile, province, minerals, trustScore } = entry;
  const companyName = profile.company_name ?? t('companyUnknown');
  const memberSince = formatDate(profile.created_at, locale);
  const countryLabel = tCountries(profile.country);
  const locationLine = province ? `${countryLabel} · ${province}` : countryLabel;

  return (
    <article className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 md:flex-row md:items-center md:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[18px] font-semibold text-ink">{companyName}</h3>
          <Badge variant={roleVariant(profile.role)}>{tRoles(profile.role)}</Badge>
          <Badge variant="success">{t('kycVerified')}</Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
            {locationLine}
          </span>
          <span>{t('memberSince', { date: memberSince })}</span>
        </div>

        {minerals.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {minerals.map((mineral) => (
              <Badge key={mineral} variant="info">
                {tMinerals(mineral)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-muted">{t('noMinerals')}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 md:items-end md:text-right">
        <div>
          <p className="text-[13px] text-muted">{t('trustScoreLabel')}</p>
          <p className="tabular-nums text-[20px] font-bold text-ink">
            {t('trustScoreValue', { score: trustScore.score })}
          </p>
        </div>

        <Button asChild variant="primary" size="sm">
          <Link href={`/directory/${profile.id}`}>{t('viewProfile')}</Link>
        </Button>
      </div>
    </article>
  );
}
