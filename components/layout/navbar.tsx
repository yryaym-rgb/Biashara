'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';
import { locales } from '@/lib/i18n/config';
import logo from '@/design/reference-logo.jpeg';

interface NavItem {
  href: '/' | '/marketplace' | '/prices' | '/solutions' | '/resources' | '/about';
  labelKey: 'home' | 'marketplace' | 'prices' | 'solutions' | 'resources' | 'about';
  hasDropdown?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/marketplace', labelKey: 'marketplace' },
  { href: '/prices', labelKey: 'prices' },
  { href: '/solutions', labelKey: 'solutions', hasDropdown: true },
  { href: '/resources', labelKey: 'resources', hasDropdown: true },
  { href: '/about', labelKey: 'about' },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!langOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen]);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3 focus-visible:outline-offset-4">
          <Image
            src={logo}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-button object-cover"
            priority
          />
          <span className="text-[14px] font-bold tracking-[0.08em] text-ink">
            {t('appName')}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label={t('mainNavigation')}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1 text-[15px] font-semibold text-body',
                  'hover:text-ink motion-safe:transition-colors motion-safe:duration-150',
                  active && 'nav-link-active',
                )}
              >
                {t(item.labelKey)}
                {item.hasDropdown ? (
                  <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block" ref={langMenuRef}>
            <button
              type="button"
              className={cn(
                'inline-flex h-11 items-center gap-1 rounded-button px-3',
                'text-[15px] font-semibold text-ink',
                'hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
              )}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              onClick={() => setLangOpen((open) => !open)}
            >
              {locale.toUpperCase()}
              <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
            </button>
            {langOpen ? (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-2 min-w-[120px] rounded-card border border-border bg-bg p-2 card-shadow"
              >
                {locales.map((item) => (
                  <li key={item} role="option" aria-selected={item === locale}>
                    <Link
                      href={pathname}
                      locale={item}
                      className={cn(
                        'block rounded-button px-3 py-2 text-[15px] font-semibold',
                        item === locale ? 'text-brand-blue' : 'text-body hover:text-ink',
                      )}
                      onClick={() => setLangOpen(false)}
                    >
                      {item.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Button asChild size="md" className="hidden md:inline-flex">
            <Link href="/register">{t('getStarted')}</Link>
          </Button>

          <button
            type="button"
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-button md:hidden',
              'text-ink hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
            )}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 top-[72px] z-40 bg-bg md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t('mainNavigation')}
        >
          <Container className="flex h-full flex-col gap-2 py-6">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-button px-4 py-3',
                      'text-[15px] font-semibold text-body',
                      active ? 'bg-bg-tint text-brand-blue' : 'hover:bg-bg-tint',
                    )}
                  >
                    <span>{t(item.labelKey)}</span>
                    {item.hasDropdown ? (
                      <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 px-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                {t('language')}
              </p>
              <div className="flex gap-2 px-4">
                {locales.map((item) => (
                  <Link
                    key={item}
                    href={pathname}
                    locale={item}
                    className={cn(
                      'rounded-button px-4 py-2 text-[15px] font-semibold',
                      item === locale
                        ? 'bg-bg-tint text-brand-blue'
                        : 'text-body hover:bg-bg-tint',
                    )}
                  >
                    {item.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto px-4 pb-8">
              <Button asChild className="w-full">
                <Link href="/register">{t('getStarted')}</Link>
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
