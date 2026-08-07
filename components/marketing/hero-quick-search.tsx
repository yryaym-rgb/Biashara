'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function HeroQuickSearch() {
  const t = useTranslations('marketing.landing.heroSearch');
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
            'h-10 w-full rounded-button border border-border bg-bg pl-9 pr-3',
            'text-[14px] text-ink placeholder:text-muted',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0',
          )}
        />
      </div>
      <Button type="submit" size="sm" className="shrink-0">
        {t('submit')}
      </Button>
    </form>
  );
}
