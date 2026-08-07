'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { isSellerRole } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/auth/session';
import {
  MarketplaceFiltersPanel,
  MarketplaceSearchBar,
} from '@/components/marketplace/marketplace-filters';

export interface MarketplaceSubheaderProps {
  profile: Profile | null;
  baseSearchParams: Record<string, string>;
  initialQuery?: string;
  initialMineral?: string;
  initialProvince?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}

export function MarketplaceSubheader({
  profile,
  baseSearchParams,
  initialQuery,
  initialMineral,
  initialProvince,
  initialMinPrice,
  initialMaxPrice,
}: MarketplaceSubheaderProps) {
  const t = useTranslations('platform.marketplace');
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const canPost =
    profile &&
    isSellerRole(profile.role) &&
    profile.kyc_status === 'approved';

  const loginHref = `/login?redirect=${encodeURIComponent('/marketplace/new')}`;

  return (
    <>
      <div className="sticky top-[72px] z-40 border-b border-border bg-bg">
        <div className="flex flex-col gap-6 py-8 md:py-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-[34px] font-bold leading-tight text-ink md:text-[40px]">
                {t('title')}
              </h1>
              <p className="mt-3 text-base text-body">{t('subtitle')}</p>
            </div>

            <div className="shrink-0">
              {canPost ? (
                <Button asChild variant="primary">
                  <Link href="/marketplace/new">{t('postOffer')}</Link>
                </Button>
              ) : profile ? (
                <Button
                  variant="primary"
                  disabled
                  title={t('kycRequiredTooltip')}
                  aria-label={t('kycRequiredTooltip')}
                >
                  {t('postOffer')}
                </Button>
              ) : (
                <Button asChild variant="primary">
                  <Link href={loginHref}>{t('postOffer')}</Link>
                </Button>
              )}
            </div>
          </div>

          <MarketplaceSearchBar
            initialQuery={initialQuery}
            baseSearchParams={baseSearchParams}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>
      </div>

      <MarketplaceFiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        initialMineral={initialMineral}
        initialProvince={initialProvince}
        initialMinPrice={initialMinPrice}
        initialMaxPrice={initialMaxPrice}
        baseSearchParams={baseSearchParams}
      />
    </>
  );
}
