'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Filter, Search, X } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { PROFILE_COUNTRY_CODES } from '@/lib/constants/countries';
import { DIRECTORY_PUBLIC_ROLES } from '@/lib/directory/constants';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export interface DirectoryFiltersPanelProps {
  open: boolean;
  onClose: () => void;
  initialRole?: string;
  initialMineral?: string;
  initialCountry?: string;
  baseSearchParams: Record<string, string>;
}

export function DirectorySearchBar({
  initialQuery,
  baseSearchParams,
  onOpenFilters,
}: {
  initialQuery?: string;
  baseSearchParams: Record<string, string>;
  onOpenFilters: () => void;
}) {
  const t = useTranslations('platform.directory');
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
    const next = params.toString();
    router.push(next ? `/directory?${next}` : '/directory');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-11"
          aria-label={t('searchPlaceholder')}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onOpenFilters}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {t('filtersButton')}
        </Button>
        <Button type="submit" variant="primary">
          {t('searchButton')}
        </Button>
      </div>
    </form>
  );
}

export function DirectoryFiltersPanel({
  open,
  onClose,
  initialRole,
  initialMineral,
  initialCountry,
  baseSearchParams,
}: DirectoryFiltersPanelProps) {
  const t = useTranslations('platform.directory');
  const tMinerals = useTranslations('minerals');
  const tRoles = useTranslations('admin.roles');
  const tCountries = useTranslations('platform.settings.countries');
  const router = useRouter();

  const [role, setRole] = React.useState(initialRole ?? '');
  const [mineral, setMineral] = React.useState(initialMineral ?? '');
  const [country, setCountry] = React.useState(initialCountry ?? '');

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setRole(initialRole ?? '');
    setMineral(initialMineral ?? '');
    setCountry(initialCountry ?? '');
  }, [open, initialRole, initialMineral, initialCountry]);

  function applyFilters() {
    const params = new URLSearchParams(baseSearchParams);
    params.delete('page');

    if (role) params.set('role', role);
    else params.delete('role');

    if (mineral) params.set('mineral', mineral);
    else params.delete('mineral');

    if (country) params.set('country', country);
    else params.delete('country');

    const query = params.toString();
    router.push(query ? `/directory?${query}` : '/directory');
    onClose();
  }

  function clearFilters() {
    const params = new URLSearchParams(baseSearchParams);
    params.delete('role');
    params.delete('mineral');
    params.delete('country');
    params.delete('page');
    const query = params.toString();
    router.push(query ? `/directory?${query}` : '/directory');
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
        className="absolute inset-0 bg-ink/40"
        aria-label={t('filtersClose')}
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-card border border-border bg-bg p-6 sm:rounded-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-ink">{t('filtersTitle')}</h2>
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-button text-ink',
              'hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
            )}
            aria-label={t('filtersClose')}
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Select
            label={t('filterRole')}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            options={[
              { value: '', label: t('filterAllRoles') },
              ...DIRECTORY_PUBLIC_ROLES.map((item) => ({
                value: item,
                label: tRoles(item),
              })),
            ]}
          />

          <Select
            label={t('filterMineral')}
            value={mineral}
            onChange={(event) => setMineral(event.target.value)}
            options={[
              { value: '', label: t('filterAllMinerals') },
              ...MINERAL_IDS.map((item) => ({
                value: item,
                label: tMinerals(item),
              })),
            ]}
          />

          <Select
            label={t('filterCountry')}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            options={[
              { value: '', label: t('filterAllCountries') },
              ...PROFILE_COUNTRY_CODES.map((code) => ({
                value: code,
                label: tCountries(code),
              })),
            ]}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" className="flex-1" onClick={clearFilters}>
            {t('filtersClear')}
          </Button>
          <Button type="button" variant="primary" className="flex-1" onClick={applyFilters}>
            {t('filtersApply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
