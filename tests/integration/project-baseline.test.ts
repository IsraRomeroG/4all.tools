import { describe, expect, it } from 'vitest';

import { readActiveAstroConfig } from '../helpers/astro-config';

describe('project baseline', () => {
  it('uses a single supported Astro config file', async () => {
    const config = await readActiveAstroConfig();

    expect(config.name).toBe('astro.config.ts');
  });

  it('declares the static i18n foundation', async () => {
    const config = await readActiveAstroConfig();

    expect(config.source).toContain("site: 'https://4all.tools'");
    expect(config.source).toContain("output: 'static'");
    expect(config.source).toContain("trailingSlash: 'always'");
    expect(config.source).toContain('locales: [...SUPPORTED_LOCALES]');
    expect(config.source).toContain('defaultLocale: DEFAULT_LOCALE');
    expect(config.source).toContain('prefixDefaultLocale: false');
  });
});
