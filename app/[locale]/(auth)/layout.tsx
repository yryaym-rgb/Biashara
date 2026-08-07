import { getTranslations } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth.shell');

  return (
    <AuthShell
      miningImageAlt={t('miningImageAlt')}
      miningPlaceholderLabel={t('miningPlaceholder')}
      homeLabel={t('homeLabel')}
    >
      {children}
    </AuthShell>
  );
}
