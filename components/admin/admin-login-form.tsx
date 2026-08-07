'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { adminLoginAction } from '@/actions/admin/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function AdminLoginForm() {
  const t = useTranslations('admin.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-tint p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="mb-2 text-[34px] font-bold text-ink">{t('title')}</h1>
          <p className="mb-6 text-base text-body">{t('description')}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await adminLoginAction(email, password);
                if (result.error) {
                  setError(t('invalidCredentials'));
                  return;
                }
                router.refresh();
              });
            }}
            className="flex flex-col gap-4"
            noValidate
          >
            {error ? (
              <p
                className="rounded-button border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Input
              type="email"
              name="email"
              label={t('emailLabel')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoComplete="email"
              required
              disabled={isPending}
            />

            <Input
              type="password"
              name="password"
              label={t('passwordLabel')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              required
              disabled={isPending}
            />

            <Button type="submit" className="mt-2 w-full" loading={isPending}>
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
