import { describe, expect, it } from 'vitest';

import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import {
  assertReciprocalSeoAlternates,
  composeSeoPageModel,
  createLocalizedPageAvailabilityResolver,
  type SeoIndexabilityResolver,
} from '@/seo';
import { getToolAreaStaticPathEntries } from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { Locale } from '@/i18n/types';
import type { RouteRecord, RouteTarget } from '@/routing/types';

const TARGET = {
  kind: 'tool',
  toolId: 'json-validator-missing-es',
} as const satisfies RouteTarget;

describe('P07 missing translation policy', () => {
  it('keeps missing locales absent from routes, SEO, static paths, and switcher links', async () => {
    const registry = missingSpanishRegistry();
    const indexabilityResolver = allIndexable;
    const english = await compose(registry, 'en', indexabilityResolver);
    const portuguese = await compose(registry, 'pt', indexabilityResolver);

    expect(registry.getCanonical('es', TARGET)).toBeNull();
    expect(registry.findByPath('es', ['desarrollo', 'validador-json'])).toBeNull();
    expect(getToolAreaStaticPathEntries(registry, 'en')).toHaveLength(1);
    expect(getToolAreaStaticPathEntries(registry, 'es')).toEqual([]);
    expect(getToolAreaStaticPathEntries(registry, 'pt')).toHaveLength(1);
    expect(getToolAreaStaticPathEntries(registry, 'fr')).toHaveLength(1);

    expect(english.seo.canonicalUrl).toBe(
      'https://4all.tools/developer/json-validator/',
    );
    expect(english.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);
    expect(english.seo.xDefaultUrl).toBe(
      'https://4all.tools/developer/json-validator/',
    );
    expect(portuguese.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);

    const switcher = buildLanguageSwitcherModel({
      cluster: english.localizedRouteCluster,
      messages: getGlobalMessages('en').language,
    });
    expect(switcher.items.find((item) => item.locale === 'es')).toEqual({
      state: 'unavailable',
      locale: 'es',
      label: 'Español',
      htmlLang: 'es',
    });
    expect(switcher.items.find((item) => item.locale === 'es')).not.toHaveProperty(
      'url',
    );

    assertReciprocalSeoAlternates([english, portuguese]);
  });

  it('keeps a published noindex locale routable but outside SEO alternates', async () => {
    const registry = fullRegistry();
    const indexabilityResolver = localeIndexability({ es: false });
    const english = await compose(registry, 'en', indexabilityResolver);
    const spanish = await compose(registry, 'es', indexabilityResolver, true);

    expect(registry.getCanonical('es', TARGET)).not.toBeNull();
    expect(getToolAreaStaticPathEntries(registry, 'es')).toHaveLength(1);
    expect(english.seo.alternates.map((alternate) => alternate.locale)).toEqual([
      'en',
      'pt',
      'fr',
    ]);
    expect(spanish.seo.canonicalUrl).toBe(
      'https://4all.tools/es/desarrollo/validador-json/',
    );
    expect(spanish.seo.robots).toEqual({ index: false, follow: true });
    expect(spanish.seo.alternates).toEqual([]);
    expect(spanish.seo.xDefaultUrl).toBeUndefined();

    const switcher = buildLanguageSwitcherModel({
      cluster: english.localizedRouteCluster,
      messages: getGlobalMessages('en').language,
    });
    expect(switcher.items.find((item) => item.locale === 'es')).toMatchObject({
      state: 'available',
      url: '/es/desarrollo/validador-json/',
    });
  });

  it('projects explicit availability states from route ownership and indexability', async () => {
    const resolver = createLocalizedPageAvailabilityResolver({
      routeRegistry: missingSpanishRegistry(),
      indexabilityResolver: allIndexable,
    });
    const published = await resolver.getAvailability(TARGET, 'en');
    const unavailable = await resolver.getAvailability(TARGET, 'es');

    expect(published.state).toBe('published-indexable');
    expect(unavailable).toEqual({
      state: 'unavailable',
      reason: 'missing-content',
    });
  });
});

async function compose(
  registry: ReturnType<typeof createRouteRegistryFromRecords>,
  locale: Locale,
  indexabilityResolver: SeoIndexabilityResolver,
  noindex = false,
) {
  return composeSeoPageModel(
    {
      subject: { kind: 'route', target: TARGET },
      locale,
      title: locale === 'en' ? 'JSON Validator' : 'Validador JSON',
      description: 'Validate JSON online.',
      noindex,
      openGraphType: 'website',
    },
    {
      routeRegistry: registry,
      indexabilityResolver,
    },
  );
}

function missingSpanishRegistry() {
  return createRouteRegistryFromRecords([
    route('en', ['developer', 'json-validator']),
    route('pt', ['desenvolvedor', 'validador-json']),
    route('fr', ['developpement', 'validateur-json']),
  ]);
}

function fullRegistry() {
  return createRouteRegistryFromRecords([
    route('en', ['developer', 'json-validator']),
    route('es', ['desarrollo', 'validador-json']),
    route('pt', ['desenvolvedor', 'validador-json']),
    route('fr', ['developpement', 'validateur-json']),
  ]);
}

const allIndexable: SeoIndexabilityResolver = {
  isIndexable: () => true,
};

function localeIndexability(
  overrides: Partial<Record<Locale, boolean>>,
): SeoIndexabilityResolver {
  return {
    isIndexable: (_target, locale) => overrides[locale] ?? true,
  };
}

function route(locale: Locale, segments: readonly string[]): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments,
    target: TARGET,
    sourceId: 'fixture:missing-translation-policy',
  };
}
