export const locales = ['fr', 'en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  zh: '中文',
};

/** Short labels for the language switcher (native language names, not translated). */
export const localeLabels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  zh: '中文',
};

const openGraphLocales: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  zh: 'zh_CN',
};

export function getOpenGraphLocale(locale: Locale): string {
  return openGraphLocales[locale];
}
