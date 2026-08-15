'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { MINERAL_IDS, type MineralId } from '@/lib/constants/minerals';
import {
  buildMineralSearchLabels,
  filterMineralsByQuery,
  type MineralSearchCount,
} from '@/lib/marketplace/mineral-search.logic';
import { fetchMineralSearchCounts } from '@/lib/marketplace/mineral-search.client';
import { cn } from '@/lib/utils/cn';

const SEARCH_DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function formatMineralLabel(label: string): string {
  return label.toLocaleUpperCase('fr-FR');
}

export function HeroQuickSearch() {
  const t = useTranslations('marketing.landing.heroSearch');
  const tMinerals = useTranslations('minerals');
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [counts, setCounts] = React.useState<MineralSearchCount[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const mineralLabels = React.useMemo(
    () =>
      buildMineralSearchLabels(
        Object.fromEntries(MINERAL_IDS.map((id) => [id, tMinerals(id)])) as Record<
          MineralId,
          string
        >,
      ),
    [tMinerals],
  );

  const matchingMineralIds = React.useMemo(
    () => filterMineralsByQuery(debouncedQuery, mineralLabels),
    [debouncedQuery, mineralLabels],
  );

  const suggestions = React.useMemo(
    () =>
      matchingMineralIds.map((mineralId) => {
        const count = counts.find((item) => item.mineralId === mineralId);
        return {
          mineralId,
          activeListingCount: count?.activeListingCount ?? 0,
          verifiedSupplierCount: count?.verifiedSupplierCount ?? 0,
        };
      }),
    [counts, matchingMineralIds],
  );

  React.useEffect(() => {
    if (!debouncedQuery.trim() || matchingMineralIds.length === 0) {
      setCounts([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    fetchMineralSearchCounts(matchingMineralIds, controller.signal)
      .then((nextCounts) => {
        if (!controller.signal.aborted) {
          setCounts(nextCounts);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCounts([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, matchingMineralIds]);

  React.useEffect(() => {
    if (!query.trim()) {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    setIsOpen(matchingMineralIds.length > 0);
    setActiveIndex(matchingMineralIds.length > 0 ? 0 : -1);
  }, [query, matchingMineralIds.length]);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/marketplace?mineral=${suggestions[activeIndex].mineralId}`);
      setIsOpen(false);
      return;
    }

    router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
  }

  function selectSuggestion(mineralId: MineralId) {
    router.push(`/marketplace?mineral=${mineralId}`);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]!.mineralId);
    }
  }

  function renderSuggestionMeta(suggestion: MineralSearchCount) {
    const mineralLabel = formatMineralLabel(tMinerals(suggestion.mineralId));

    if (suggestion.verifiedSupplierCount > 0) {
      return t('suggestionCounts', {
        mineral: mineralLabel,
        activeCount: suggestion.activeListingCount,
        supplierCount: suggestion.verifiedSupplierCount,
      });
    }

    return t('suggestionActiveOnly', {
      mineral: mineralLabel,
      activeCount: suggestion.activeListingCount,
    });
  }

  const showSuggestions = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="flex w-full max-w-xl flex-col gap-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        {t('heading')}
      </p>

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
            onFocus={() => {
              if (query.trim() && matchingMineralIds.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listboxId : undefined}
            aria-activedescendant={
              showSuggestions && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
            className={cn(
              'h-[46px] w-full rounded-button border border-border bg-bg pl-11 pr-4',
              'text-[15px] text-ink placeholder:text-muted',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0',
              'focus-visible:outline-[color:rgba(29,95,168,0.35)]',
            )}
          />

          {showSuggestions ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={t('suggestionsLabel')}
              className={cn(
                'absolute left-0 right-0 top-[calc(100%+8px)] z-50',
                'max-h-64 overflow-y-auto rounded-card border border-border bg-bg p-2 card-shadow',
              )}
            >
              {isLoading ? (
                <li className="px-3 py-2 text-[13px] text-muted" role="presentation">
                  {t('loading')}
                </li>
              ) : null}

              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.mineralId}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    className={cn(
                      'flex w-full rounded-button px-3 py-2 text-left',
                      'text-[13px] font-semibold text-ink',
                      index === activeIndex ? 'bg-bg-tint text-brand-blue' : 'hover:bg-bg-tint',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0',
                      'focus-visible:outline-[color:rgba(29,95,168,0.35)]',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion.mineralId)}
                  >
                    {renderSuggestionMeta(suggestion)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
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
                'inline-flex min-h-10 min-w-10 items-center justify-center rounded-button border border-border bg-bg px-3',
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
