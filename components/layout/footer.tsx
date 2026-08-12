import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Container } from '@/components/ui/container';
import { KitengeStrip } from '@/components/ui/kitenge-strip';

export async function Footer() {
  const t = await getTranslations('footer');

  const columns = [
    {
      title: t('platform.title'),
      links: [
        { href: '/marketplace' as const, label: t('platform.marketplace') },
        { href: '/prices' as const, label: t('platform.prices') },
        { href: '/resources/tracabilite-minerais' as const, label: t('platform.traceability') },
        { href: '/calendar' as const, label: t('platform.calendar') },
      ],
    },
    {
      title: t('company.title'),
      links: [
        { href: '/about' as const, label: t('company.about') },
        { href: '/resources' as const, label: t('company.resources') },
      ],
    },
  ];

  return (
    <>
      <KitengeStrip />
      <footer className="bg-brand-blue-dark text-[color:var(--white)]">
        <Container className="py-16">
          <div className="mb-12 max-w-xl space-y-3">
            <p className="text-[14px] font-bold tracking-[0.12em] text-[color:var(--white)]">
              BIASHARA
            </p>
            <p className="text-[15px] text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]">
              {t('tagline')}
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:max-w-2xl">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-[15px] font-semibold text-[color:var(--white)]">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-[15px] text-[color:color-mix(in_srgb,var(--white)_75%,transparent)] hover:text-[color:var(--white)] motion-safe:transition-colors motion-safe:duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-[color:color-mix(in_srgb,var(--white)_15%,transparent)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[color:color-mix(in_srgb,var(--white)_65%,transparent)]">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-[13px] font-semibold text-brand-gold">{t('closingLine')}</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
