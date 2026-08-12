'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { waitlistSignupAction } from '@/actions/waitlist';
import { WAITLIST_COUNTRY_CODES } from '@/lib/validators/waitlist';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export function AfricanNetworkWaitlist() {
  const t = useTranslations('marketing.landing.africanNetwork');
  const [email, setEmail] = React.useState('');
  const [countryInterest, setCountryInterest] = React.useState('');
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<'new' | 'existing' | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await waitlistSignupAction({
        email,
        countryInterest: countryInterest || null,
      });

      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }

      setSuccess(result.alreadyRegistered ? 'existing' : 'new');
      if (!result.alreadyRegistered) {
        setEmail('');
        setCountryInterest('');
      }
    } finally {
      setLoading(false);
    }
  }

  const countryOptions = WAITLIST_COUNTRY_CODES.map((code) => ({
    value: code,
    label: t(`countries.${code}`),
  }));

  return (
    <div
      className={cn(
        'rounded-card border border-[color:color-mix(in_srgb,var(--white)_18%,transparent)]',
        'bg-[color:color-mix(in_srgb,var(--white)_6%,var(--brand-blue-dark))] p-6 md:p-8',
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-gold">
            {t('brand')}
          </p>
          <h3 className="text-[18px] font-semibold text-[color:var(--white)]">{t('title')}</h3>
          <p className="text-[15px] text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]">
            {t('today')}
          </p>
          <p className="text-[15px] text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]">
            {t('tomorrow')}
          </p>
          <p className="text-[15px] text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]">
            {t('description')}
          </p>
        </div>

        {success ? (
          <div
            className={cn(
              'rounded-card border px-4 py-3 text-[14px]',
              'border-[color:color-mix(in_srgb,var(--market-live)_35%,transparent)]',
              'bg-[color:color-mix(in_srgb,var(--market-live)_12%,transparent)]',
              'text-[color:var(--white)]',
            )}
            role="status"
          >
            {success === 'existing' ? t('successExisting') : t('successNew')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              id="waitlist-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              label={t('emailLabel')}
              placeholder={t('emailPlaceholder')}
              error={errorKey ? t(`errors.${errorKey}`) : undefined}
              className="bg-bg"
            />

            <Select
              id="waitlist-country"
              name="countryInterest"
              value={countryInterest}
              onChange={(event) => setCountryInterest(event.target.value)}
              label={t('countryLabel')}
              hint={t('countryHint')}
              options={countryOptions}
              placeholder={t('countryPlaceholder')}
              className="bg-bg"
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
              {t('submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
