'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Filter, Search, X } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { DRC_PROVINCES } from '@/lib/constants/provinces';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export interface MarketplaceFiltersPanelProps {
  open: boolean;
  onClose: () => void;
  initialMineral?: string;
  initialProvince?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  baseSearchParams: Record<string, string>;
}

export function MarketplaceFiltersPanel({
  open,
  onClose,
  initialMineral,
  initialProvince,
  initialMinPrice,
  initialMaxPrice,
  baseSearchParams,
}: MarketplaceFiltersPanelProps) {
  const t = useTranslations('platform.marketplace');
  const tMinerals = useTranslations('minerals');
  const router = useRouter();

  const [mineral, setMineral] = React.useState(initialMineral ?? '');
  const [province, setProvince] = React.useState(initialProvince ?? '');
  const [minPrice, setMinPrice] = React.useState(initialMinPrice ?? '');
  const [maxPrice, setMaxPrice] = React.useState(initialMaxPrice ?? '');

  React.useEffect(() => {
    if (open) {
      setMineral(initialMineral ?? '');
      setProvince(initialProvince ?? '');
      setMinPrice(initialMinPrice ?? '');
      setMaxPrice(initialMaxPrice ?? '');
    }
  }, [open, initialMineral, initialProvince, initialMinPrice, initialMaxPrice]);

  function applyFilters() {
    const params = new URLSearchParams(baseSearchParams);
    params.delete('page');

    if (mineral) {
      params.set('mineral', mineral);
    } else {
      params.delete('mineral');
    }

    if (province) {
      params.set('province', province);
    } else {
      params.delete('province');
    }

    if (minPrice.trim()) {
      params.set('minPrice', minPrice.trim());
    } else {
      params.delete('minPrice');
    }

    if (maxPrice.trim()) {
      params.set('maxPrice', maxPrice.trim());
    } else {
      params.delete('maxPrice');
    }

    const query = params.toString();
    router.push(query ? `/marketplace?${query}` : '/marketplace');
    onClose();
  }

  function clearFilters() {
    const params = new URLSearchParams(baseSearchParams);
    params.delete('mineral');
    params.delete('province');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');
    const query = params.toString();
    router.push(query ? `/marketplace?${query}` : '/marketplace');
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('filtersTitle')}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
        onClick={onClose}
        aria-label={t('filtersClose')}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-card border border-border bg-bg p-6 shadow-card',
          'mx-4 mb-4 sm:mb-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold text-ink">{t('filtersTitle')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-button text-muted hover:bg-bg-tint"
            aria-label={t('filtersClose')}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Select
            label={t('filterMineral')}
            value={mineral}
            onChange={(event) => setMineral(event.target.value)}
            options={[
              { value: '', label: t('filterAllMinerals') },
              ...MINERAL_IDS.map((id) => ({
                value: id,
                label: tMinerals(id),
              })),
            ]}
          />

          <Select
            label={t('filterProvince')}
            value={province}
            onChange={(event) => setProvince(event.target.value)}
            options={[
              { value: '', label: t('filterAllProvinces') },
              ...DRC_PROVINCES.map((name) => ({ value: name, label: name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('filterMinPrice')}
              type="number"
              min={0}
              step="any"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
            />
            <Input
              label={t('filterMaxPrice')}
              type="number"
              min={0}
              step="any"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={applyFilters}>
            {t('filtersApply')}
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            {t('filtersClear')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface MarketplaceSearchBarProps {
  initialQuery?: string;
  baseSearchParams: Record<string, string>;
  onOpenFilters: () => void;
}

export function MarketplaceSearchBar({
  initialQuery,
  baseSearchParams,
  onOpenFilters,
}: MarketplaceSearchBarProps) {
  const t = useTranslations('platform.marketplace');
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery ?? '');

  React.useEffect(() => {
    setQuery(initialQuery ?? '');
  }, [initialQuery]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(baseSearchParams);
    params.delete('page');
    const trimmed = query.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    const search = params.toString();
    router.push(search ? `/marketplace?${search}` : '/marketplace');
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search')}
          className="h-[46px] w-full rounded-button border border-border bg-bg pl-11 pr-4 text-[15px] text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0"
          aria-label={t('search')}
        />
      </form>

      <Button
        type="button"
        variant="secondary"
        className="shrink-0"
        onClick={onOpenFilters}
      >
        <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        {t('filters')}
      </Button>
    </div>
  );
}
