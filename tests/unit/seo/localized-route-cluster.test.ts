import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import {
  DuplicateLocaleVariantError,
  SeoIndexabilityMismatchError,
  buildLocalizedRouteCluster,
  composeSeoPageModel,
  type SeoIndexabilityResolver,
} from '@/seo';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import type { Locale } from '@/i18n/types';

const PROJECT_ROOT = new URL('../../../', import.meta.url);
const JSON_VALIDATOR_TARGET = {
  kind: 'tool',
  toolId: 'json-validator',
} as const satisfies RouteTarget;
const JSON_VALIDATOR_URLS = [
  'https://4all.tools/developer/json-validator/',
  'https://4all.tools/es/desarrollo/validador-json/',
  'https://4all.tools/pt/desenvolvedor/validador-json/',
  'https://4all.tools/fr/developpement/validateur-json/',
] as const;

describe('localized route clusters', () => {
  it('selects the current canonical route by stable target and locale', async () => {
    const cluster = await buildLocalizedRouteCluster(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        currentLocale: 'es',
      },
      {
        routeRegistry: jsonValidatorRegistry(),
        indexabilityResolver: allIndexable,
      },
    );

    expect(cluster.current.locale).toBe('es');
    expect(cluster.current.absoluteUrl).toBe(JSON_VALIDATOR_URLS[1]);
    expect(cluster.current.route?.target).toEqual(JSON_VALIDATOR_TARGET);
    expect(cluster.variants.map((variant) => variant.locale)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
    expect(cluster.variants.map((variant) => variant.absoluteUrl)).toEqual(
      JSON_VALIDATOR_URLS,
    );
    expect(cluster.variants.some((variant) => variant.locale === 'es')).toBe(
      true,
    );
  });

  it('builds home variants from locale URL policy without a route target', async () => {
    const cluster = await buildLocalizedRouteCluster(
      {
        subject: {
          kind: 'home',
        },
        currentLocale: 'fr',
      },
      {
        indexabilityResolver: allIndexable,
      },
    );

    expect(cluster.current.route).toBeNull();
    expect(cluster.current.relativeUrl).toBe('/fr/');
    expect(cluster.variants.map((variant) => variant.relativeUrl)).toEqual([
      '/',
      '/es/',
      '/pt/',
      '/fr/',
    ]);
    expect(cluster.variants.map((variant) => variant.hrefLang)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
  });

  it('composes reciprocal alternates and x-default for indexable variants', async () => {
    const composition = await composeSeoPageModel(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        locale: 'fr',
        title: 'Validateur JSON',
        description: 'Valider du JSON en ligne.',
        noindex: false,
        openGraphType: 'website',
      },
      {
        routeRegistry: jsonValidatorRegistry(),
        indexabilityResolver: allIndexable,
      },
    );

    expect(composition.seo.canonicalUrl).toBe(JSON_VALIDATOR_URLS[3]);
    expect(composition.seo.alternates.map((alternate) => alternate.url)).toEqual(
      JSON_VALIDATOR_URLS,
    );
    expect(composition.seo.xDefaultUrl).toBe(JSON_VALIDATOR_URLS[0]);
    expect(composition.seo.openGraph.url).toBe(composition.seo.canonicalUrl);
  });

  it('omits x-default when the English equivalent is absent', async () => {
    const composition = await composeSeoPageModel(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        locale: 'es',
        title: 'Validador JSON',
        description: 'Validar JSON online.',
        noindex: false,
        openGraphType: 'website',
      },
      {
        routeRegistry: createRouteRegistryFromRecords([
          route('es', ['desarrollo', 'validador-json']),
          route('pt', ['desenvolvedor', 'validador-json']),
          route('fr', ['developpement', 'validateur-json']),
        ]),
        indexabilityResolver: allIndexable,
      },
    );

    expect(composition.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'es',
      'pt',
      'fr',
    ]);
    expect(composition.seo.xDefaultUrl).toBeUndefined();
  });

  it('excludes a missing locale without synthesizing a URL', async () => {
    const composition = await composeSeoPageModel(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        locale: 'en',
        title: 'JSON Validator',
        description: 'Validate JSON online.',
        noindex: false,
        openGraphType: 'website',
      },
      {
        routeRegistry: createRouteRegistryFromRecords([
          route('en', ['developer', 'json-validator']),
          route('pt', ['desenvolvedor', 'validador-json']),
          route('fr', ['developpement', 'validateur-json']),
        ]),
        indexabilityResolver: allIndexable,
      },
    );

    expect(composition.localizedRouteCluster.variants.map((variant) => variant.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);
    expect(composition.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);
    expect(composition.seo.alternates.map((alternate) => alternate.url)).not.toContain(
      JSON_VALIDATOR_URLS[1],
    );
  });

  it('retains noindex variants for navigation and filters them from SEO alternates', async () => {
    const resolver = createLocaleIndexabilityResolver({
      es: false,
    });
    const english = await composeSeoPageModel(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        locale: 'en',
        title: 'JSON Validator',
        description: 'Validate JSON online.',
        noindex: false,
        openGraphType: 'website',
      },
      {
        routeRegistry: jsonValidatorRegistry(),
        indexabilityResolver: resolver,
      },
    );
    const spanish = await composeSeoPageModel(
      {
        subject: {
          kind: 'route',
          target: JSON_VALIDATOR_TARGET,
        },
        locale: 'es',
        title: 'Validador JSON',
        description: 'Validar JSON online.',
        noindex: true,
        openGraphType: 'website',
      },
      {
        routeRegistry: jsonValidatorRegistry(),
        indexabilityResolver: resolver,
      },
    );

    expect(english.localizedRouteCluster.variants.map((variant) => variant.locale)).toEqual([
      'en',
      'es',
      'pt',
      'fr',
    ]);
    expect(english.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);
    expect(spanish.seo.canonicalUrl).toBe(JSON_VALIDATOR_URLS[1]);
    expect(spanish.seo.robots).toEqual({
      index: false,
      follow: true,
    });
    expect(spanish.seo.alternates).toEqual([]);
    expect(spanish.seo.xDefaultUrl).toBeUndefined();
  });

  it('rejects duplicate locale variants defensively', async () => {
    const first = route('en', ['developer', 'json-validator'], 'fixture:first');
    const second = route('en', ['developer', 'json-validator-copy'], 'fixture:second');

    await expect(
      buildLocalizedRouteCluster(
        {
          subject: {
            kind: 'route',
            target: JSON_VALIDATOR_TARGET,
          },
          currentLocale: 'en',
        },
        {
          routeRegistry: {
            getCanonical: () => first,
            getByTarget: () => [first, second],
          },
          indexabilityResolver: allIndexable,
        },
      ),
    ).rejects.toBeInstanceOf(DuplicateLocaleVariantError);
  });

  it('fails when content noindex and resolved indexability disagree', async () => {
    await expect(
      composeSeoPageModel(
        {
          subject: {
            kind: 'route',
            target: JSON_VALIDATOR_TARGET,
          },
          locale: 'es',
          title: 'Validador JSON',
          description: 'Validar JSON online.',
          noindex: false,
          openGraphType: 'website',
        },
        {
          routeRegistry: jsonValidatorRegistry(),
          indexabilityResolver: createLocaleIndexabilityResolver({
            es: false,
          }),
        },
      ),
    ).rejects.toBeInstanceOf(SeoIndexabilityMismatchError);
  });

  it('keeps the indexability resolver on the published content index boundary', async () => {
    const source = await readFile(
      new URL('src/seo/indexability.ts', PROJECT_ROOT),
      'utf8',
    );

    expect(source).toContain('PublishedContentIndexes');
    expect(source).toContain('getPublishedContentIndexes');
    expect(source).not.toContain('getCollection');
    expect(source).not.toContain('Astro.url');
  });
});

const allIndexable: SeoIndexabilityResolver = {
  isIndexable: () => true,
};

function jsonValidatorRegistry() {
  return createRouteRegistryFromRecords([
    route('en', ['developer', 'json-validator']),
    route('es', ['desarrollo', 'validador-json']),
    route('pt', ['desenvolvedor', 'validador-json']),
    route('fr', ['developpement', 'validateur-json']),
  ]);
}

function createLocaleIndexabilityResolver(
  overrides: Partial<Record<Locale, boolean>>,
): SeoIndexabilityResolver {
  return {
    isIndexable: (_target, locale) => overrides[locale] ?? true,
  };
}

function route(
  locale: Locale,
  segments: readonly string[],
  sourceId = 'fixture:seo-cluster',
): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments,
    target: JSON_VALIDATOR_TARGET,
    sourceId,
  };
}
