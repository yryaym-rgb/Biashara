import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function AuthDivider() {
  const t = useTranslations('auth.login');

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-bg px-4 text-[13px] text-muted">{t('orContinueWith')}</span>
      </div>
    </div>
  );
}

export function OAuthButtons() {
  const t = useTranslations('auth.login');

  const providers = [
    { id: 'google', label: t('oauthGoogle') },
    { id: 'microsoft', label: t('oauthMicrosoft') },
    { id: 'apple', label: t('oauthApple') },
  ] as const;

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="secondary"
          className="w-full"
          disabled
          title={t('comingSoon')}
          aria-label={`${provider.label} — ${t('comingSoon')}`}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
