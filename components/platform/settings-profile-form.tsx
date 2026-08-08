'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { updateProfileAction } from '@/actions/settings';
import { profileSettingsFormSchema } from '@/lib/validators/settings';
import { PROFILE_COUNTRY_CODES } from '@/lib/constants/countries';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/dates';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

export interface SettingsProfileFormProps {
  locale: string;
  email: string;
  role: UserRole;
  memberSince: string;
  initialCompanyName: string;
  initialCountry: string;
  initialPhone: string;
}

export function SettingsProfileForm({
  locale,
  email,
  role,
  memberSince,
  initialCompanyName,
  initialCountry,
  initialPhone,
}: SettingsProfileFormProps) {
  const t = useTranslations('platform.settings.profileForm');
  const tRoles = useTranslations('admin.roles');
  const tCountries = useTranslations('platform.settings.countries');
  const tValidation = useTranslations('validation');

  const router = useRouter();

  const [companyName, setCompanyName] = React.useState(initialCompanyName);
  const [country, setCountry] = React.useState(
    PROFILE_COUNTRY_CODES.includes(initialCountry as (typeof PROFILE_COUNTRY_CODES)[number])
      ? initialCountry
      : 'CD',
  );
  const [phone, setPhone] = React.useState(initialPhone);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const countryOptions = PROFILE_COUNTRY_CODES.map((code) => ({
    value: code,
    label: tCountries(code),
  }));

  function mapFieldError(field: string, code: string): string {
    if (field === 'companyName' && (code === 'too_small' || code === 'invalid_type')) {
      return tValidation('required');
    }
    if (field === 'country') {
      return tValidation('required');
    }
    if (field === 'phone') {
      return tValidation('phoneInvalid');
    }
    return tValidation('required');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = profileSettingsFormSchema.safeParse({
      companyName,
      country,
      phone,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        errors[field] = mapFieldError(field, issue.code);
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfileAction(parsed.data);
      if (result.error) {
        if (result.error === 'validation') {
          setFormError(tValidation('required'));
        } else {
          setFormError(t('error'));
        }
        return;
      }

      setSuccess(t('success'));
      router.refresh();
    } catch {
      setFormError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[13px] text-muted">{t('email')}</dt>
            <dd className="mt-1 text-[15px] text-ink">{email}</dd>
            <p className="mt-1 text-[13px] text-muted">{t('emailReadOnlyHint')}</p>
          </div>
          <div>
            <dt className="text-[13px] text-muted">{t('role')}</dt>
            <dd className="mt-1 text-[15px] text-ink">{tRoles(role)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">{t('memberSince')}</dt>
            <dd className="mt-1 text-[15px] text-ink">{formatDate(memberSince, locale)}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError ? (
            <p
              className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger"
              role="alert"
            >
              {formError}
            </p>
          ) : null}
          {success ? (
            <p
              className="rounded-button border border-success/20 bg-success/10 px-4 py-3 text-[13px] text-success"
              role="status"
            >
              {success}
            </p>
          ) : null}

          <Input
            name="companyName"
            label={t('companyName')}
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            error={fieldErrors.companyName}
            required
            disabled={loading}
            autoComplete="organization"
          />

          <Select
            name="country"
            label={t('country')}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            options={countryOptions}
            error={fieldErrors.country}
            required
            disabled={loading}
          />

          <Input
            name="phone"
            type="tel"
            label={t('phone')}
            hint={t('phoneHint')}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={fieldErrors.phone}
            disabled={loading}
            autoComplete="tel"
          />

          <Button type="submit" loading={loading} disabled={loading}>
            {t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
