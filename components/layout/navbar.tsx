'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown, Menu, X } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { LogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { useTickerScrollVisibility } from '@/components/marketing/landing-price-ticker';
import { UserAvatarMenu } from '@/components/platform/user-avatar-menu';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';
import { locales, type Locale } from '@/lib/i18n/config';
import logo from '@/design/reference-logo.jpeg';

interface NavItem {
  href: '/' | '/marketplace' | '/prices' | '/calendar' | '/solutions' | '/resources' | '/about';
  labelKey: 'home' | 'marketplaceNav' | 'prices' | 'calendar' | 'solutions' | 'resources' | 'about';
  hasDropdown?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/marketplace', labelKey: 'marketplaceNav' },
  { href: '/prices', labelKey: 'prices' },
  { href: '/calendar', labelKey: 'calendar' },
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

/** Secondary links that hide earlier when horizontal space is tight. */
function getDesktopNavItemClass(item: NavItem, isAuthenticated: boolean): string {
  if (item.labelKey === 'calendar') {
    return isAuthenticated ? 'hidden xl:inline-flex' : 'hidden';
  }

  if (!isAuthenticated && item.labelKey === 'about') {
    return 'hidden';
  }

  if (isAuthenticated && item.labelKey === 'about') {
    return 'hidden xl:inline-flex';
  }

  if (!isAuthenticated && item.labelKey === 'resources') {
    return 'hidden 2xl:inline-flex';
  }

  return '';
}

export interface NavbarProps {
  stickyOffsetClass?: string;
  topBandHeight?: number;
  isAuthenticated?: boolean;
  companyName?: string | null;
  email?: string | null;
}

export function Navbar({
  stickyOffsetClass = 'top-0',
  topBandHeight = 0,
  isAuthenticated = false,
  companyName = null,
  email = null,
}: NavbarProps) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { tickerVisible } = useTickerScrollVisibility();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  const effectiveStickyClass =
    topBandHeight > 0 && tickerVisible ? stickyOffsetClass : 'top-0';

  React.useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const mobileNavTopClass =
    topBandHeight > 0 && tickerVisible ? 'top-[112px]' : 'top-[68px]';

  return (
    <>
    <header
      data-nav-auth={isAuthenticated ? 'member' : 'guest'}
      className={cn(
        'sticky z-50 border-b motion-safe:transition-[background-color,box-shadow,border-color] motion-safe:duration-200',
        isScrolled
          ? 'border-[color:color-mix(in_srgb,var(--border)_85%,transparent)] bg-[color:color-mix(in_srgb,var(--bg)_97%,transparent)] shadow-[0_2px_12px_rgba(14,42,71,0.08)] backdrop-blur-[16px]'
          : 'border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-[12px]',
        effectiveStickyClass,
      )}
    >
      <Container
        className={cn(
          'flex h-[68px] items-center',
          isAuthenticated ? 'gap-2 lg:gap-3' : 'gap-3 lg:gap-4',
        )}
      >
        <Link
          href="/"
          data-navbar-logo
          className="relative z-[2] flex shrink-0 items-center gap-2 focus-visible:outline-offset-4"
        >
          <Image
            src={logo}
            alt=""
            width={54}
            height={54}
            className="h-[54px] w-[54px] rounded-button object-cover"
            priority
          />
          <span className="text-[14px] font-bold tracking-[0.08em] text-ink">
            {t('appName')}
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 overflow-hidden md:block">
          <nav
            className={cn(
              'flex min-w-0 items-center justify-center gap-0',
            )}
            aria-label={t('mainNavigation')}
          >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative inline-flex items-center gap-1 whitespace-nowrap px-2 py-2 lg:px-1.5 xl:px-2',
                  'text-[15px] font-semibold motion-safe:transition-colors motion-safe:duration-150',
                  active ? 'text-ink' : 'text-body hover:text-ink',
                  getDesktopNavItemClass(item, isAuthenticated),
                )}
              >
                {t(item.labelKey)}
                {item.hasDropdown ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                ) : null}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-brand-gold',
                    'motion-safe:transition-all motion-safe:duration-150',
                    active ? 'w-5 opacity-100' : 'w-0 opacity-0 group-hover:w-5 group-hover:opacity-100',
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
          </nav>
        </div>

        <div
          data-navbar-actions
          className="relative z-[1] flex shrink-0 items-center justify-end gap-1.5 md:gap-2"
        >
          <span
            className={cn(
              'hidden cursor-default select-none items-center gap-1.5 whitespace-nowrap rounded-[4px] bg-[color:color-mix(in_srgb,var(--market-live)_12%,transparent)] px-2 py-1',
              isAuthenticated ? 'lg:inline-flex' : 'xl:inline-flex',
            )}
            aria-label={t('drcMarketActive')}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-market-live" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink">
              {t('drcMarketActive')}
            </span>
          </span>

          <div
            className={cn(
              'hidden h-6 w-px bg-border',
              isAuthenticated ? 'lg:block' : 'xl:block',
            )}
            aria-hidden="true"
          />

          <div className="flex items-center gap-1">
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button
                type="button"
                className={cn(
                  'inline-flex h-10 items-center gap-1 rounded-button px-2.5',
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

            {isAuthenticated ? (
              <div
                className={cn(
                  'relative inline-flex items-center gap-0.5 rounded-button border border-border bg-bg px-1.5 py-0.5',
                  '[&>div>button]:h-8 [&>div>button]:w-8 [&>div>button]:bg-transparent [&>div>button]:hover:bg-transparent',
                )}
              >
                <UserAvatarMenu
                  companyName={companyName}
                  email={email}
                  onLogoutRequest={() => setLogoutDialogOpen(true)}
                />
                <ChevronDown className="hidden h-3.5 w-3.5 pr-0.5 text-muted md:block" aria-hidden="true" />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'hidden text-[15px] font-semibold text-brand-blue md:inline-flex',
                    'hover:text-brand-blue-dark motion-safe:transition-colors motion-safe:duration-150',
                  )}
                >
                  {t('login')}
                </Link>
                <Button
                  asChild
                  size="md"
                  className={cn(
                    'hidden md:inline-flex lg:h-9 lg:px-4 xl:h-11 xl:px-[22px]',
                  )}
                >
                  <Link href="/marketplace">{t('accessMarket')}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-button md:hidden',
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
    </header>

    {mobileOpen ? (
      <div
        id="mobile-nav"
        className={cn(
          'fixed right-0 bottom-0 left-0 z-40 overflow-y-auto overscroll-contain bg-bg md:hidden',
          mobileNavTopClass,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('mainNavigation')}
      >
        <Container className="flex min-h-full flex-col gap-2 py-6">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex min-h-[44px] items-center justify-between rounded-button px-4 py-3',
                    'text-[15px] font-semibold text-body',
                    active ? 'bg-bg-tint text-ink' : 'hover:bg-bg-tint',
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
                    'inline-flex min-h-[44px] items-center rounded-button px-4 py-2 text-[15px] font-semibold',
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

          {!isAuthenticated ? (
            <div className="mt-auto flex flex-col gap-3 px-4 pb-8">
              <Link
                href="/login"
                className="inline-flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-brand-blue"
              >
                {t('login')}
              </Link>
              <Button asChild className="w-full">
                <Link href="/marketplace">{t('accessMarket')}</Link>
              </Button>
            </div>
          ) : null}
        </Container>
      </div>
    ) : null}

    <LogoutConfirmDialog
      open={logoutDialogOpen}
      onClose={() => setLogoutDialogOpen(false)}
      onConfirm={async () => {
        await logoutAction(locale);
      }}
    />
    </>
  );
}
