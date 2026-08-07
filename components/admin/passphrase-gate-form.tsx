'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { verifyAdminGatePassphrase } from '@/actions/admin/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from '@/lib/i18n/navigation';
import { useState } from 'react';

export function PassphraseGateForm() {
  const t = useTranslations('admin.gate');
  const router = useRouter();
  const [passphrase, setPassphrase] = useState('');
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
                const result = await verifyAdminGatePassphrase(passphrase);
                if (result.error) {
                  setError(t('accessDenied'));
                  return;
                }
                router.refresh();
              });
            }}
          >
            <Input
              type="password"
              label={t('passphraseLabel')}
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError(null);
              }}
              required
              autoComplete="current-password"
              error={error ?? undefined}
            />
            <Button type="submit" className="mt-6 w-full" loading={isPending}>
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
