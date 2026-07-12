import { describe, expect, it } from 'vitest';

import { readActiveAstroConfig } from '../helpers/astro-config';

describe('project baseline', () => {
  it('uses a single supported Astro config file', async () => {
    const config = await readActiveAstroConfig();

    expect(['astro.config.ts', 'astro.config.mjs']).toContain(config.name);
  });

  it('declares the static i18n foundation', async () => {
    const config = await readActiveAstroConfig();

    expect(config.source).toContain("site: 'https://4all.tools'");
    expect(config.source).toContain("output: 'static'");
    expect(config.source).toContain("trailingSlash: 'always'");
    expect(config.source).toContain("locales: ['en', 'es', 'pt', 'fr']");
    expect(config.source).toContain("defaultLocale: 'en'");
    expect(config.source).toContain('prefixDefaultLocale: false');
  });
});
