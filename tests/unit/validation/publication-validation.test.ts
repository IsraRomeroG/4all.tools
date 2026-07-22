import { describe, expect, it } from 'vitest';

import type { RouteDefinition } from '@/routing/definitions';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import { buildAbsoluteUrl } from '@/routing/builders';
import type {
  ArchitectureComposedPageModel,
  ArchitectureCompositionPorts,
} from '@/validation/architecture';
import { validatePublicationAndSeo } from '@/validation/architecture';

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
      'NON_RECIPROCAL_SEO_CLUSTER',
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
      composeBlogIndex: async (locale) => fixedPage('blog-index', locale, true),
    });
    const issues = await validatePublicationAndSeo({
      routeDefinitions: [],
      routeRegistry: fakeRouteRegistry([route]),
      composition: ports,
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'FIXED_ROOT_COMPOSITION_FAILED',
      'NOINDEX_SEO_ALTERNATE_CONFLICT',
      'NON_RECIPROCAL_SEO_CLUSTER',
    ]);
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
): ArchitectureComposedPageModel {
  const url = buildAbsoluteUrl({ locale: route.locale, segments: route.segments });

  return page({
    kind: route.target.kind,
    locale: route.locale,
    route,
    subject: route.target,
    url,
    indexable: reciprocal,
    alternateUrls: reciprocal ? [url] : [],
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
  const cluster = {
    subject: input.subject as never,
    currentLocale: input.locale,
    current,
    variants: [current],
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
  const target = kind === 'tool'
    ? { kind, toolId: id }
    : kind === 'article'
      ? { kind, articleId: id }
      : { kind: 'tool-category' as const, categoryId: id };

  return {
    area: kind === 'article' ? 'blog' : 'tools',
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
