'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/lib/i18n/navigation';
import {
  verifyEmailAction,
  exchangeAuthCodeAction,
  resendVerificationAction,
} from '@/actions/auth';

type VerifyState = 'verifying' | 'success' | 'error';

export function VerifyContent() {
  const t = useTranslations('auth.verify');
  const searchParams = useSearchParams();

  const [state, setState] = React.useState<VerifyState>('verifying');
  const [resendEmail, setResendEmail] = React.useState('');
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [resendError, setResendError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function verify() {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') as 'signup' | 'email' | null;
      const code = searchParams.get('code');

      if (code) {
        const result = await exchangeAuthCodeAction(code);
        setState('success' in result && result.success ? 'success' : 'error');
        return;
      }

      if (tokenHash && type) {
        const result = await verifyEmailAction(tokenHash, type);
        setState('success' in result && result.success ? 'success' : 'error');
        return;
      }

      setState('error');
    }

    void verify();
  }, [searchParams]);

  async function handleResend(event: React.FormEvent) {
    event.preventDefault();
    setResendError(null);
    setResendSuccess(false);
    setResendLoading(true);

    try {
      const result = await resendVerificationAction(resendEmail);
      if (result.error) {
        setResendError(t('resendError'));
        return;
      }
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
    }
  }

  if (state === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        <p className="text-[15px] text-body">{t('verifying')}</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={1.75} aria-hidden="true" />
        <h1 className="text-[34px] font-bold leading-[1.2] text-ink">{t('successTitle')}</h1>
        <p className="text-[15px] text-body">{t('successDescription')}</p>
        <Button asChild className="w-full">
          <Link href="/login">{t('goToLogin')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-danger" strokeWidth={1.75} aria-hidden="true" />
        <h1 className="text-[34px] font-bold leading-[1.2] text-ink">{t('errorTitle')}</h1>
        <p className="text-[15px] text-body">{t('errorDescription')}</p>
      </div>

      <form onSubmit={handleResend} className="flex flex-col gap-4">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          label={t('resendEmailLabel')}
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          required
          disabled={resendLoading}
        />

        {resendSuccess ? (
          <p className="text-[13px] text-success" role="status">
            {t('resendSuccess')}
          </p>
        ) : null}

        {resendError ? (
          <p className="text-[13px] text-danger" role="alert">
            {resendError}
          </p>
        ) : null}

        <Button type="submit" variant="secondary" loading={resendLoading} disabled={resendLoading}>
          {t('resend')}
        </Button>
      </form>

      <p className="text-center text-[15px] text-body">
        <Link href="/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
          {t('goToLogin')}
        </Link>
      </p>
    </div>
  );
}
