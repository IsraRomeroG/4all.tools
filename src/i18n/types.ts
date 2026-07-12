export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'fr'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Localized<T> = Record<Locale, T>;

export type PartialLocalized<T> = Partial<Record<Locale, T>>;

export interface LocaleDefinition {
  code: Locale;
  pathPrefix: string;
  label: string;
  htmlLang: string;
  direction: 'ltr' | 'rtl';
}
