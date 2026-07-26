import { describe, expect, it } from 'vitest';

import { getGlobalMessages } from '@/i18n/messages/registry';
import { buildLanguageSwitcherModel } from '@/navigation/language-switcher';
import {
  assertReciprocalSeoAlternates,
  composeSeoPageModel,
  type SeoIndexabilityResolver,
} from '@/seo';
import {
  getBlogStaticPathEntries,
  getToolAreaStaticPathEntries,
} from '@/routing/static-paths';
import { createRouteRegistryFromRecords } from '@/routing/registry';
import type { Locale } from '@/i18n/types';
import type { RouteRecord, RouteTarget } from '@/routing/types';

const TARGET = {
  kind: 'tool',
  toolId: 'json-validator-missing-es',
} as const satisfies RouteTarget;

const BLOG_TARGET = {
  kind: 'article',
  articleId: 'what-is-json',
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

  it('keeps a missing localized blog route absent without English fallback', async () => {
    const registry = missingSpanishBlogRegistry();
    const english = await composeBlog(registry, 'en');
    const switcher = buildLanguageSwitcherModel({
      cluster: english.localizedRouteCluster,
      messages: getGlobalMessages('en').language,
    });

    expect(registry.getCanonical('en', BLOG_TARGET)).not.toBeNull();
    expect(registry.getCanonical('es', BLOG_TARGET)).toBeNull();
    expect(getBlogStaticPathEntries(registry, 'en')).toHaveLength(1);
    expect(getBlogStaticPathEntries(registry, 'es')).toEqual([]);
    expect(english.localizedRouteCluster.variants.map((variant) => variant.locale)).toEqual([
      'en',
    ]);
    expect(switcher.items.find((item) => item.locale === 'es')).toEqual({
      state: 'unavailable',
      locale: 'es',
      label: 'Espa\u00f1ol',
      htmlLang: 'es',
    });
    expect(switcher.items.find((item) => item.locale === 'es')).not.toHaveProperty(
      'url',
    );
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

async function composeBlog(
  registry: ReturnType<typeof createRouteRegistryFromRecords>,
  locale: Locale,
) {
  return composeSeoPageModel(
    {
      subject: { kind: 'route', target: BLOG_TARGET },
      locale,
      title: 'What Is JSON',
      description: 'A practical introduction to JSON.',
      noindex: false,
      openGraphType: 'website',
    },
    {
      routeRegistry: registry,
      indexabilityResolver: allIndexable,
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

function missingSpanishBlogRegistry() {
  return createRouteRegistryFromRecords([
    blogRoute('en', ['blog', 'development', 'json-guides', 'what-is-json']),
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

function blogRoute(locale: Locale, segments: readonly string[]): RouteRecord {
  return {
    area: 'blog',
    locale,
    segments,
    target: BLOG_TARGET,
    sourceId: 'fixture:missing-blog-translation-policy',
  };
}
