import { describe, expect, it, vi } from 'vitest';

import { SUPPORTED_LOCALES } from '@/i18n/config';
import { buildAbsoluteUrl } from '@/routing/builders';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';
import {
  createSitemapEligibleUrlSetLoader,
  isSitemapUrlEligible,
  registerSitemapUrlIndexability,
  type SitemapEligibilityDependencies,
} from '@/seo/sitemap-eligibility';

const TARGET = {
  kind: 'tool',
  toolId: 'json-validator',
} as const;

describe('sitemap eligibility', () => {
  it('includes indexable route records and fixed roots', async () => {
    const urls = await createLoader({
      records: [route('en', ['developer', 'json-validator'])],
    })();

    expect(urls).toContain('https://4all.tools/developer/json-validator/');
    expect(urls).toContain('https://4all.tools/');
    expect(urls).toContain('https://4all.tools/es/');
    expect(urls).toContain('https://4all.tools/blog/');
    expect(urls).toContain('https://4all.tools/fr/blog/');
  });

  it('excludes noindex route records', async () => {
    const urls = await createLoader({
      records: [route('es', ['desarrollo', 'validador-json'])],
      isIndexable: () => false,
    })();

    expect(urls).not.toContain('https://4all.tools/es/desarrollo/validador-json/');
  });

  it('does not fabricate missing locales or route-less content', async () => {
    const urls = await createLoader({
      records: [route('en', ['developer', 'json-validator'])],
    })();

    expect(urls).not.toContain('https://4all.tools/es/desarrollo/validador-json/');
    expect(urls).not.toContain('https://4all.tools/developer/missing-tool/');
  });

  it('keeps the default English route unprefixed', async () => {
    const urls = await createLoader({
      records: [route('en', ['developer', 'json-validator'])],
    })();

    expect(urls).toContain('https://4all.tools/developer/json-validator/');
    expect(urls).not.toContain('https://4all.tools/en/developer/json-validator/');
  });

  it('filters rendered noindex URLs while retaining indexable URLs', () => {
    const url = 'https://4all.tools/es/desarrollo/validador-json/';

    registerSitemapUrlIndexability(url, false);
    expect(isSitemapUrlEligible(url)).toBe(false);

    registerSitemapUrlIndexability(url, true);
    expect(isSitemapUrlEligible(url)).toBe(true);
  });

  it('memoizes registry and resolver construction', async () => {
    const getRouteRegistry = vi.fn(async () =>
      createRouteRegistryFromRecords([route('en', ['developer', 'json-validator'])]),
    );
    const getIndexabilityResolver = vi.fn(async () => ({
      isIndexable: () => true,
    }));
    const loader = createSitemapEligibleUrlSetLoader({
      getRouteRegistry,
      getIndexabilityResolver,
      locales: SUPPORTED_LOCALES,
      buildAbsoluteUrl,
    });

    const firstPromise = loader();
    const secondPromise = loader();

    expect(secondPromise).toBe(firstPromise);
    await Promise.all([firstPromise, secondPromise]);
    expect(getRouteRegistry).toHaveBeenCalledTimes(1);
    expect(getIndexabilityResolver).toHaveBeenCalledTimes(1);
  });
});

function createLoader(input: {
  readonly records: readonly RouteRecord[];
  readonly isIndexable?: () => boolean;
}): () => Promise<ReadonlySet<string>> {
  const dependencies: SitemapEligibilityDependencies = {
    getRouteRegistry: async () => createRouteRegistryFromRecords(input.records),
    getIndexabilityResolver: async () => ({
      isIndexable: input.isIndexable ?? (() => true),
    }),
    locales: SUPPORTED_LOCALES,
    buildAbsoluteUrl,
  };

  return createSitemapEligibleUrlSetLoader(dependencies);
}

function route(locale: RouteRecord['locale'], segments: readonly string[]): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments,
    target: TARGET,
    sourceId: 'fixture:sitemap-eligibility',
  };
}
