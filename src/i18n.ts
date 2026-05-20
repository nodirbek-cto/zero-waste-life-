export type Locale = 'en' | 'uz' | 'ru';

export const locales: Locale[] = ['en', 'uz', 'ru'];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getMessages(locale: Locale) {
  return import(`./messages/${locale}.json`).then((module) => module.default);
}
