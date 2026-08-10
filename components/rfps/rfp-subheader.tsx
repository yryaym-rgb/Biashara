'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/auth/session';

export interface RfpSubheaderProps {
  profile: Profile | null;
}

export function RfpSubheader({ profile }: RfpSubheaderProps) {
  const t = useTranslations('platform.rfps');

  const canPublish =
    profile &&
    (profile.role === 'buyer' || profile.role === 'institution') &&
    profile.kyc_status === 'approved';

  const loginHref = `/login?redirect=${encodeURIComponent('/rfps/new')}`;

  return (
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
            {canPublish ? (
              <Button asChild variant="primary">
                <Link href="/rfps/new">{t('publishRequest')}</Link>
              </Button>
            ) : profile ? (
              <Button
                variant="primary"
                disabled
                title={t('kycRequiredTooltip')}
                aria-label={t('kycRequiredTooltip')}
              >
                {t('publishRequest')}
              </Button>
            ) : (
              <Button asChild variant="primary">
                <Link href={loginHref}>{t('publishRequest')}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
