import { describe, expect, it } from 'vitest';

import astroConfig from '../../../astro.config';
import { SITE_URL, TRAILING_SLASH_POLICY } from '@/config/site';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';
import { readActiveAstroConfig } from '../../helpers/astro-config';

describe('Astro locale configuration', () => {
  it('uses the TypeScript Astro config as the single active config', async () => {
    const config = await readActiveAstroConfig();

    expect(config.name).toBe('astro.config.ts');
  });

  it('consumes the shared application locale constants', () => {
    expect(astroConfig.i18n?.locales).toEqual([...SUPPORTED_LOCALES]);
    expect(astroConfig.i18n?.defaultLocale).toBe(DEFAULT_LOCALE);
  });

  it('consumes the shared site URL and trailing slash policy', () => {
    expect(astroConfig.site).toBe(SITE_URL.toString());
    expect(astroConfig.trailingSlash).toBe(TRAILING_SLASH_POLICY);
  });

  it('does not maintain a hidden literal locale list in Astro config', async () => {
    const config = await readActiveAstroConfig();

    expect(config.source).toContain('locales: [...SUPPORTED_LOCALES]');
    expect(config.source).toContain('defaultLocale: DEFAULT_LOCALE');
    expect(config.source).not.toContain("site: 'https://4all.tools'");
    expect(config.source).not.toContain("trailingSlash: 'always'");
    expect(config.source).not.toContain("locales: ['en', 'es', 'pt', 'fr']");
  });
});
