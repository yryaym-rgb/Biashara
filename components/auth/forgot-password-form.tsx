'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { forgotPasswordAction } from '@/actions/auth';
import { forgotPasswordSchema } from '@/lib/validators/auth';
import type { Locale } from '@/lib/i18n/config';

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('validation');
  const locale = useLocale() as Locale;

  const [email, setEmail] = React.useState('');
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(tValidation('email'));
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordAction(parsed.data.email, locale);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-[34px] font-bold leading-[1.2] text-ink">{t('title')}</h1>
        <p className="text-[15px] text-body">{t('description')}</p>
      </div>

      {submitted ? (
        <p
          className="rounded-button border border-success/20 bg-success/10 px-4 py-3 text-[15px] text-ink"
          role="status"
        >
          {t('success')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            label={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError ?? undefined}
            required
            disabled={loading}
          />

          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {t('submit')}
          </Button>
        </form>
      )}

      <p className="text-center text-[15px] text-body">
        <Link
          href="/login"
          className="inline-flex min-h-10 items-center px-3 py-0 font-semibold text-brand-blue hover:text-brand-blue-dark"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
