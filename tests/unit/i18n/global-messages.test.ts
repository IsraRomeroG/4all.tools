import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { SUPPORTED_LOCALES } from '@/i18n/config';
import { en } from '@/i18n/messages/en';
import { es } from '@/i18n/messages/es';
import { fr } from '@/i18n/messages/fr';
import { GLOBAL_MESSAGES, getGlobalMessages } from '@/i18n/messages/registry';
import { pt } from '@/i18n/messages/pt';

const registryUrl = new URL('../../../src/i18n/messages/registry.ts', import.meta.url);
const dictionaryUrls = [
  new URL('../../../src/i18n/messages/en.ts', import.meta.url),
  new URL('../../../src/i18n/messages/es.ts', import.meta.url),
  new URL('../../../src/i18n/messages/pt.ts', import.meta.url),
  new URL('../../../src/i18n/messages/fr.ts', import.meta.url),
];

describe('global messages', () => {
  it('registers one dictionary for every supported locale', () => {
    expect(Object.keys(GLOBAL_MESSAGES)).toEqual([...SUPPORTED_LOCALES]);
  });

  it('returns the requested locale dictionary without fallback', () => {
    expect(getGlobalMessages('en')).toBe(en);
    expect(getGlobalMessages('es')).toBe(es);
    expect(getGlobalMessages('pt')).toBe(pt);
    expect(getGlobalMessages('fr')).toBe(fr);
    expect((getGlobalMessages as (locale: string) => unknown)('de')).toBe(
      undefined,
    );
  });

  it('allows translated values to differ from English literals', () => {
    expect(en.nav.home).toBe('Home');
    expect(es.nav.home).toBe('Inicio');
  });

  it('keeps representative global keys present in every dictionary', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const messages = GLOBAL_MESSAGES[locale];

      expect(messages.nav.home).toBeTruthy();
      expect(messages.common.copy).toBeTruthy();
      expect(messages.search.placeholder).toBeTruthy();
      expect(messages.language.changeLanguage).toBeTruthy();
      expect(messages.footer.privacy).toBeTruthy();
      expect(messages.accessibility.openMenu).toBeTruthy();
    }
  });

  it('does not include tool-specific namespaces in global messages', () => {
    for (const messages of Object.values(GLOBAL_MESSAGES)) {
      expect(messages).not.toHaveProperty('jsonValidator');
      expect(messages).not.toHaveProperty('robotsTxtValidator');
      expect(messages).not.toHaveProperty('passwordGenerator');
    }
  });

  it('keeps lookup implementation free of silent fallback branches', async () => {
    const source = await readFile(registryUrl, 'utf8');

    expect(source).not.toContain('?? GLOBAL_MESSAGES.en');
    expect(source).not.toContain('|| GLOBAL_MESSAGES.en');
  });

  it('uses immutable authoring intent for each dictionary', async () => {
    const sources = await Promise.all(
      dictionaryUrls.map((url) => readFile(url, 'utf8')),
    );

    expect(sources.every((source) => source.includes('} as const'))).toBe(true);
  });
});
