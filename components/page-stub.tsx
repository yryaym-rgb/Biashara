import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

interface PageStubProps {
  titleKey: string;
  namespace?: string;
}

export async function PageStub({ titleKey, namespace = 'routes' }: PageStubProps) {
  const t = await getTranslations(namespace);

  return (
    <main>
      <h1>{t(titleKey)}</h1>
    </main>
  );
}
