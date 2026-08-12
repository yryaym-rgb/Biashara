'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { cn } from '@/lib/utils/cn';

export function HeroQuickSearch() {
  const t = useTranslations('marketing.landing.heroSearch');
  const tMinerals = useTranslations('minerals');
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className={cn(
              'h-[46px] w-full rounded-button border border-border bg-bg pl-11 pr-4',
              'text-[15px] text-ink placeholder:text-muted',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0',
              'focus-visible:outline-[color:rgba(29,95,168,0.35)]',
            )}
          />
        </div>
        <Button type="submit" className="w-full shrink-0 sm:w-auto">
          {t('submit')}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('popularSearches')}
        </p>
        <div className="flex flex-wrap gap-2">
          {MINERAL_IDS.map((mineralId) => (
            <Link
              key={mineralId}
              href={`/marketplace?mineral=${mineralId}`}
              className={cn(
                'inline-flex h-9 items-center rounded-button border border-border bg-bg px-3',
                'text-[13px] font-semibold text-ink',
                'hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
            >
              {tMinerals(mineralId)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
