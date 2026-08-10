'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { DirectoryFiltersPanel, DirectorySearchBar } from '@/components/directory/directory-filters';

export interface DirectorySubheaderProps {
  baseSearchParams: Record<string, string>;
  initialQuery?: string;
  initialRole?: string;
  initialMineral?: string;
  initialCountry?: string;
}

export function DirectorySubheader({
  baseSearchParams,
  initialQuery,
  initialRole,
  initialMineral,
  initialCountry,
}: DirectorySubheaderProps) {
  const t = useTranslations('platform.directory');
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  return (
    <>
      <div className="sticky top-[72px] z-40 border-b border-border bg-bg">
        <div className="flex flex-col gap-6 py-8 md:py-12">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('eyebrow')}
            </p>
            <h1 className="mt-2 text-[34px] font-bold leading-tight text-ink md:text-[40px]">
              {t('title')}
            </h1>
            <p className="mt-3 text-base text-body">{t('subtitle')}</p>
          </div>

          <DirectorySearchBar
            initialQuery={initialQuery}
            baseSearchParams={baseSearchParams}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>
      </div>

      <DirectoryFiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        initialRole={initialRole}
        initialMineral={initialMineral}
        initialCountry={initialCountry}
        baseSearchParams={baseSearchParams}
      />
    </>
  );
}
