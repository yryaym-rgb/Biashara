'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { changePasswordAction } from '@/actions/settings';
import { changePasswordSchema } from '@/lib/validators/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/auth/password-input';

export function SettingsPasswordForm() {
  const t = useTranslations('platform.settings.security');
  const tAuth = useTranslations('auth.register');
  const tErrors = useTranslations('auth.errors');
  const tValidation = useTranslations('validation');

  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function mapFieldError(field: string, message: string): string {
    if (message === 'passwordMismatch') {
      return t('passwordMismatch');
    }
    if (field === 'password' && message === 'too_small') {
      return tValidation('passwordMin');
    }
    if (field === 'password' && message === 'too_big') {
      return tValidation('passwordMax');
    }
    return tValidation('required');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = changePasswordSchema.safeParse({ password, passwordConfirm });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        errors[field] = mapFieldError(field, issue.message);
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await changePasswordAction(parsed.data);
      if (result.error) {
        if (result.error === 'validation') {
          setFormError(tValidation('required'));
        } else if ('errorKey' in result && result.errorKey) {
          setFormError(tErrors(result.errorKey));
        } else {
          setFormError(t('error'));
        }
        return;
      }

      setPassword('');
      setPasswordConfirm('');
      setSuccess(t('success'));
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
      <CardContent>
        <p className="mb-6 text-[15px] text-body">{t('description')}</p>

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

          <PasswordInput
            name="password"
            autoComplete="new-password"
            label={t('newPassword')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            showLabel={tAuth('showPassword')}
            hideLabel={tAuth('hidePassword')}
            required
            disabled={loading}
          />

          <PasswordInput
            name="passwordConfirm"
            autoComplete="new-password"
            label={t('confirmPassword')}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            error={fieldErrors.passwordConfirm}
            showLabel={tAuth('showPassword')}
            hideLabel={tAuth('hidePassword')}
            required
            disabled={loading}
          />

          <Button type="submit" loading={loading} disabled={loading}>
            {t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
