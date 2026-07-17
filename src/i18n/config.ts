import type { Locale, LocaleDefinition, Localized } from './types';

export { SUPPORTED_LOCALES } from './types';

export const DEFAULT_LOCALE = 'en' satisfies Locale;

export const LOCALES = {
  en: {
    code: 'en',
    pathPrefix: '',
    label: 'English',
    htmlLang: 'en',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    pathPrefix: 'es',
    label: 'Español',
    htmlLang: 'es',
    direction: 'ltr',
  },
  pt: {
    code: 'pt',
    pathPrefix: 'pt',
    label: 'Português',
    htmlLang: 'pt',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    pathPrefix: 'fr',
    label: 'Français',
    htmlLang: 'fr',
    direction: 'ltr',
  },
} as const satisfies Localized<LocaleDefinition>;
