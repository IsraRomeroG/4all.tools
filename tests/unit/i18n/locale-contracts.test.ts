import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, SUPPORTED_LOCALES } from '@/i18n/config';
import { isLocale, parseLocale } from '@/i18n/guards';

describe('locale contracts', () => {
  it('declares the supported locales in deterministic order', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'es', 'pt', 'fr']);
  });

  it('uses English as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('keeps the default locale in the supported locale tuple', () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('accepts only exact supported locale strings', () => {
    expect(SUPPORTED_LOCALES.every((locale) => isLocale(locale))).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale('EN')).toBe(false);
    expect(isLocale('es-MX')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('throws a descriptive error when parsing unsupported locales', () => {
    expect(parseLocale('fr')).toBe('fr');
    expect(() => parseLocale('de')).toThrow('Unsupported locale: "de".');
  });

  it('defines exactly one locale definition for every supported locale', () => {
    expect(Object.keys(LOCALES)).toEqual([...SUPPORTED_LOCALES]);

    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALES[locale].code).toBe(locale);
    }
  });

  it('declares prefix intent without implementing routing', () => {
    expect(LOCALES.en.pathPrefix).toBe('');
    expect(LOCALES.es.pathPrefix).toBe('es');
    expect(LOCALES.pt.pathPrefix).toBe('pt');
    expect(LOCALES.fr.pathPrefix).toBe('fr');
  });

  it('declares left-to-right direction for every initial locale', () => {
    expect(SUPPORTED_LOCALES.map((locale) => LOCALES[locale].direction)).toEqual([
      'ltr',
      'ltr',
      'ltr',
      'ltr',
    ]);
  });
});
