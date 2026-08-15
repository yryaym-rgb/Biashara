'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/auth/password-input';
import { AuthDivider, OAuthButtons } from '@/components/auth/oauth-buttons';
import { Link } from '@/lib/i18n/navigation';
import { loginAction } from '@/actions/auth';
import { loginSchema } from '@/lib/validators/auth';
import type { Locale } from '@/lib/i18n/config';

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const tValidation = useTranslations('validation');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [tab, setTab] = React.useState('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otpEmail, setOtpEmail] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field === 'email') {
          errors.email = tValidation('email');
        } else if (field === 'password') {
          errors.password = tValidation('required');
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await loginAction(parsed.data.email, parsed.data.password, locale);
      if (result.error) {
        const errorKey = result.errorKey ?? 'unknown';
        setFormError(tErrors(errorKey));
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[34px] font-bold leading-[1.2] text-ink">{t('heading')}</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="password">{t('tabPassword')}</TabsTrigger>
          <TabsTrigger value="otp">{t('tabOtp')}</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4" noValidate>
            {formError ? (
              <p className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger" role="alert">
                {formError}
              </p>
            ) : null}

            <Input
              type="email"
              name="email"
              autoComplete="email"
              label={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              required
              disabled={loading}
            />

            <div className="flex flex-col gap-2">
              <PasswordInput
                name="password"
                autoComplete="current-password"
                label={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                required
                disabled={loading}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="inline-flex min-h-10 items-center py-0 text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              {t('submit')}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp">
          {/* TODO: Wire signInWithOtp once Supabase OTP provider is configured for this project */}
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()} noValidate>
            <p className="text-[13px] text-muted">{t('otpDescription')}</p>
            <Input
              type="email"
              name="otpEmail"
              autoComplete="email"
              label={t('email')}
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              disabled
            />
            <Button type="submit" className="w-full" disabled title={t('comingSoon')}>
              {t('otpSubmit')}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <AuthDivider />
      <OAuthButtons />

      <p className="text-center text-[15px] text-body">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="inline-flex min-h-10 items-center px-3 py-0 font-semibold text-brand-blue hover:text-brand-blue-dark"
        >
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
