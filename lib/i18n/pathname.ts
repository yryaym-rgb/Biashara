import { defaultLocale, locales, type Locale } from './config';

/** Resolve locale from a URL pathname (prefix locales only; default when absent). */
export function getLocaleFromPathname(pathname: string): Locale {
  for (const locale of locales) {
    if (locale === defaultLocale) {
      continue;
    }
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return defaultLocale;
}

/** Remove a non-default locale prefix from a pathname. */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) {
      continue;
    }
    const prefix = `/${locale}`;
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || '/';
    }
    if (pathname === prefix) {
      return '/';
    }
  }
  return pathname;
}
