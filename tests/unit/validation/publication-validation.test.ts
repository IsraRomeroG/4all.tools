import { describe, expect, it } from 'vitest';

import type { RouteDefinition } from '@/routing/definitions';
import { createRouteRegistryFromRecords } from '@/routing/registry/route-index';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { buildAbsoluteUrl } from '@/routing/builders';
import type {
  ArchitectureComposedPageModel,
  ArchitectureCompositionPorts,
} from '@/validation/architecture';
import {
  createProductionArchitectureContext,
  validateArchitecture,
  validatePublicationAndSeo,
} from '@/validation/architecture';

describe('architecture publication and SEO validation', () => {
  it('reuses route validation and reports zero-variant and composition failures', async () => {
    const validRecord = record('tool', 'json-validator', 'json-validator');
    const failingRecord = record('article', 'what-is-json', 'blog/what-is-json');
    const routes = [validRecord, failingRecord, { ...validRecord, sourceId: 'duplicate' }];
    const ports = compositionPorts({
      composeRoute: async (route) => {
        if (route.target.kind === 'article') {
          throw new Error('article composition failed');
        }

        return pageForRoute(route, true);
      },
    });
    const issues = await validatePublicationAndSeo({
      routeDefinitions: [
        toolDefinition('json-validator', 'published'),
        toolDefinition('missing-tool', 'published'),
      ],
      routeRegistry: fakeRouteRegistry(routes),
      composition: ports,
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'PUBLIC_ROUTE_COMPOSITION_FAILED',
      'DUPLICATE_ROUTE_RECORD',
      'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT',
    ]);
  });

  it('detects nonreciprocal and noindex SEO models plus fixed-root failures', async () => {
    const route = record('tool', 'json-validator', 'json-validator');
    const ports = compositionPorts({
      composeRoute: async (record) => {
        const page = pageForRoute(record, false);

        return {
          ...page,
          seo: {
            ...page.seo,
            alternates: [{ locale: 'en', hrefLang: 'en', url: page.seo.canonicalUrl }],
            xDefaultUrl: page.seo.canonicalUrl,
          },
        } as never;
      },
      composeHome: async (locale) => {
        if (locale === 'fr') {
          throw new Error('home failed');
        }

        return fixedPage('home', locale, false);
      },
      composeBlogIndex: async (locale) => {
        if (locale === 'pt') {
          throw new Error('blog index failed');
        }

        return fixedPage('blog-index', locale, true);
      },
    });
    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: ports,
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'FIXED_ROOT_COMPOSITION_FAILED',
      'FIXED_ROOT_COMPOSITION_FAILED',
      'NOINDEX_SEO_ALTERNATE_CONFLICT',
      'NON_RECIPROCAL_SEO_CLUSTER',
    ]);
  });

  it('rejects a route cluster whose subject targets a different stable entity', async () => {
    const route = record('article', 'article-a', 'article-a');
    const page = pageForRoute(route, true);

    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: compositionPorts({
        composeRoute: async () => ({
          ...page,
          localizedRouteCluster: {
            ...page.localizedRouteCluster,
            subject: { kind: 'route', target: { kind: 'article', articleId: 'article-b' } },
          },
        }),
      }),
    });

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'SEO_CLUSTER_TARGET_MISMATCH',
        entityKey: 'article:article-a',
        details: expect.objectContaining({
          expectedTarget: 'article:article-a',
          actualSubjectTarget: 'article:article-b',
        }),
      }),
    );
  });

  it('rejects a routed variant whose target differs from the stable cluster target', async () => {
    const route = record('article', 'article-a', 'article-a');
    const page = pageForRoute(route, true);
    const wrongVariant = {
      ...page.localizedRouteCluster.current,
      locale: 'es' as const,
      hrefLang: 'es',
      relativeUrl: '/es/article-b',
      absoluteUrl: 'https://4all.tools/es/article-b',
      route: {
        ...route,
        locale: 'es' as const,
        segments: ['article-b'],
        target: { kind: 'article' as const, articleId: 'article-b' },
      },
    };

    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: compositionPorts({
        composeRoute: async () => ({
          ...page,
          localizedRouteCluster: {
            ...page.localizedRouteCluster,
            variants: [page.localizedRouteCluster.current, wrongVariant],
          },
        }),
      }),
    });

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'SEO_CLUSTER_TARGET_MISMATCH',
        details: expect.objectContaining({
          expectedTarget: 'article:article-a',
          mismatchedVariants: [
            { locale: 'es', target: 'article:article-b', path: '/es/article-b' },
          ],
        }),
      }),
    );
  });

  it('keeps route/page target mismatch as a public composition failure', async () => {
    const route = record('article', 'article-a', 'article-a');
    const mismatchedRoute = {
      ...route,
      target: { kind: 'article' as const, articleId: 'article-b' },
      segments: ['article-b'],
    };

    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: compositionPorts({
        composeRoute: async () => pageForRoute(mismatchedRoute, true),
      }),
    });

    expect(issues.map((issue) => issue.code)).toContain(
      'PUBLIC_ROUTE_COMPOSITION_FAILED',
    );
  });

  it.each([
    ['tool', 'json-validator', 'json-validator'],
    ['tool-category', 'json', 'json'],
    ['article', 'what-is-json', 'blog/what-is-json'],
    ['blog-category', 'json-guides', 'blog/development/json-guides'],
  ] as const)('accepts the %s route-target kind', async (kind, id, segment) => {
    const route = record(kind, id, segment);

    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: compositionPorts(),
    });

    expect(issues).toEqual([]);
  });

  it('accepts a reciprocal routed cluster with a missing locale', async () => {
    const english = record('tool', 'json-validator', 'json-validator');
    const spanish = {
      ...english,
      locale: 'es' as const,
      segments: ['validador-json'],
    };
    const routes = [english, spanish];

    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry(routes),
      composition: compositionPorts({
        composeRoute: async (route) => pageForRoute(route, true, routes),
      }),
    });

    expect(issues).toEqual([]);
  });

  it('does not fabricate routes for route-less articles or classification-only categories', async () => {
    const productionContext = await createProductionArchitectureContext();
    const routeDefinitions = productionContext.routeDefinitions.filter(
      (route) => route.kind !== 'article' && route.kind !== 'blog-category',
    );
    const routeRecords = productionContext.routeRegistry
      .getAll()
      .filter(
        (route) => route.target.kind !== 'article' && route.target.kind !== 'blog-category',
      );
    const routeRegistry = createRouteRegistryFromRecords(routeRecords);
    const article = productionContext.content.all.blog.find(
      (entry) => entry.data.articleId === 'what-is-json' && entry.data.status === 'published',
    );
    const category = productionContext.content.all.blogCategories.find(
      (entry) => entry.data.categoryId === 'json-guides' && entry.data.status === 'published',
    );

    expect(article).toBeDefined();
    expect(category).toBeDefined();
    expect(
      routeDefinitions.every(
        (route) => route.kind === 'tool' || route.kind === 'tool-category',
      ),
    ).toBe(true);
    expect(
      routeRegistry.getByTarget({ kind: 'article', articleId: 'what-is-json' }),
    ).toEqual([]);
    expect(
      routeRegistry.getByTarget({ kind: 'blog-category', categoryId: 'json-guides' }),
    ).toEqual([]);

    const report = await validateArchitecture({
      context: {
        ...productionContext,
        routeDefinitions,
        routeRegistry,
        composition: compositionPorts({
          composeRoute: async (route) =>
            pageForRoute(route, true, routeRegistry.getByTarget(route.target)),
        }),
      },
      sourceGraph: { files: [], edges: [] },
    });

    expect(report.issues).toEqual([]);
    expect(routeRegistry.getAll()).toEqual(routeRecords);
  });
});

function compositionPorts(
  overrides: Partial<ArchitectureCompositionPorts> = {},
): ArchitectureCompositionPorts {
  return {
    composeRoute: async (route) => pageForRoute(route, true),
    composeHome: async (locale) => fixedPage('home', locale, false),
    composeBlogIndex: async (locale) => fixedPage('blog-index', locale, false),
    ...overrides,
  };
}

function pageForRoute(
  route: RouteRecord,
  reciprocal: boolean,
  clusterRecords: readonly RouteRecord[] = [route],
): ArchitectureComposedPageModel {
  const url = buildAbsoluteUrl({ locale: route.locale, segments: route.segments });
  const variants = clusterRecords.map((clusterRecord) => ({
    locale: clusterRecord.locale,
    hrefLang: clusterRecord.locale,
    relativeUrl: buildAbsoluteUrl({
      locale: clusterRecord.locale,
      segments: clusterRecord.segments,
    }),
    absoluteUrl: buildAbsoluteUrl({
      locale: clusterRecord.locale,
      segments: clusterRecord.segments,
    }),
    route: clusterRecord,
    published: true as const,
    indexable: true,
  }));

  return page({
    kind: route.target.kind,
    locale: route.locale,
    route,
    subject: route.target,
    url,
    indexable: reciprocal,
    alternateUrls: reciprocal ? variants.map((variant) => variant.absoluteUrl) : [],
    variants,
  });
}

function fixedPage(
  kind: 'home' | 'blog-index',
  locale: 'en' | 'es' | 'pt' | 'fr',
  indexable: boolean,
): ArchitectureComposedPageModel {
  const url = `https://4all.tools/${kind}/${locale}`;

  return page({
    kind,
    locale,
    route: null,
    subject: { kind },
    url,
    indexable,
    alternateUrls: indexable ? [url] : [],
  });
}

function page(input: {
  readonly kind: ArchitectureComposedPageModel['kind'];
  readonly locale: 'en' | 'es' | 'pt' | 'fr';
  readonly route: RouteRecord | null;
  readonly subject: RouteTarget | { readonly kind: 'home' | 'blog-index' };
  readonly url: string;
  readonly indexable: boolean;
  readonly alternateUrls: readonly string[];
  readonly variants?: ArchitectureComposedPageModel['localizedRouteCluster']['variants'];
}): ArchitectureComposedPageModel {
  const current = {
    locale: input.locale,
    hrefLang: input.locale,
    relativeUrl: input.url,
    absoluteUrl: input.url,
    route: input.route,
    published: true as const,
    indexable: input.indexable,
  };
  const subject = input.subject.kind === 'home' || input.subject.kind === 'blog-index'
    ? input.subject
    : { kind: 'route' as const, target: input.subject as RouteTarget };
  const cluster = {
    subject,
    currentLocale: input.locale,
    current: input.variants?.find((variant) => variant.locale === input.locale) ?? current,
    variants: input.variants ?? [current],
  };
  const seo = {
    title: input.kind,
    description: input.kind,
    canonicalUrl: input.url,
    robots: input.indexable
      ? { index: true as const, follow: true as const }
      : { index: false as const, follow: true as const },
    alternates: input.alternateUrls.map((url) => ({
      locale: input.locale,
      hrefLang: input.locale,
      url,
    })),
    ...(input.indexable ? { xDefaultUrl: input.url } : {}),
    openGraph: {
      type: 'website' as const,
      title: input.kind,
      description: input.kind,
      url: input.url,
      siteName: '4all.tools' as const,
    },
  };

  return { ...input, localizedRouteCluster: cluster, seo } as ArchitectureComposedPageModel;
}

function record(
  kind: RouteTarget['kind'],
  id: string,
  segment: string,
): RouteRecord {
  const target: RouteTarget = kind === 'tool'
    ? { kind, toolId: id }
    : kind === 'tool-category'
      ? { kind, categoryId: id }
      : kind === 'article'
        ? { kind, articleId: id }
        : { kind, categoryId: id };

  return {
    area: kind === 'article' || kind === 'blog-category' ? 'blog' : 'tools',
    locale: 'en',
    segments: segment.split('/'),
    target,
    sourceId: `${kind}-routes`,
  } as RouteRecord;
}

function toolDefinition(id: string, status: string): RouteDefinition {
  return {
    kind: 'tool',
    definition: {
      toolId: id,
      rootCategoryId: 'developer',
      primaryCategoryId: 'json',
      strategy: 'flat',
      localized: { en: { slug: id } },
      status: status as 'published' | 'draft' | 'archived',
    },
  };
}

function fakeRouteRegistry(records: readonly RouteRecord[]) {
  return {
    getAll: () => records,
    findByPath: () => null,
    getCanonical: () => records[0] ?? null,
    getByTarget: () => records,
  };
}
