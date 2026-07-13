import { describe, expect, it } from 'vitest';

import { readActiveAstroConfig } from '../helpers/astro-config';

describe('project baseline', () => {
  it('uses a single supported Astro config file', async () => {
    const config = await readActiveAstroConfig();

    expect(config.name).toBe('astro.config.ts');
  });

  it('declares the static i18n foundation', async () => {
    const config = await readActiveAstroConfig();

    expect(config.source).toContain(
      "import { SITE_URL, TRAILING_SLASH_POLICY } from './src/config/site';",
    );
    expect(config.source).toContain('site: SITE_URL.toString()');
    expect(config.source).toContain("output: 'static'");
    expect(config.source).toContain('trailingSlash: TRAILING_SLASH_POLICY');
    expect(config.source).toContain('locales: [...SUPPORTED_LOCALES]');
    expect(config.source).toContain('defaultLocale: DEFAULT_LOCALE');
    expect(config.source).toContain('prefixDefaultLocale: false');
  });
});
