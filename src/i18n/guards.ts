import { SUPPORTED_LOCALES, type Locale } from './types';

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: string): Locale {
  if (isLocale(value)) {
    return value;
  }

  throw new Error(`Unsupported locale: "${value}".`);
}
