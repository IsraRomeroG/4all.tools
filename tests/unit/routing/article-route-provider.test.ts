import { describe, expect, it } from 'vitest';

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import type { ArticleContentEntry } from '@/content/queries';
import type { Locale } from '@/i18n/types';
import {
  articleRouteProvider,
  createArticleRouteProvider,
} from '@/routing/providers/article-route-provider';
import type { RoutePublicationAvailability } from '@/routing/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

describe('article route provider', () => {
  it('derives one route definition per published localized article entry', async () => {
    const definitions = await articleRouteProvider.getRouteDefinitions();

    expect(definitions).toHaveLength(4);
    expect(
      definitions.map((route) =>
        route.kind === 'article'
          ? {
              articleId: route.definition.articleId,
              locale: Object.keys(route.definition.localized)[0],
              primaryCategoryId: route.definition.primaryCategoryId,
              strategy: route.definition.strategy,
              status: route.definition.status,
              sourceId: route.definition.sourceId,
              localized: route.definition.localized,
            }
          : route,
      ),
    ).toEqual([
      {
        articleId: 'what-is-json',
        locale: 'en',
        primaryCategoryId: 'json-guides',
        strategy: 'hierarchical',
        status: 'published',
        sourceId: 'en/development/what-is-json',
        localized: { en: { slug: 'what-is-json' } },
      },
      {
        articleId: 'what-is-json',
        locale: 'es',
        primaryCategoryId: 'json-guides',
        strategy: 'hierarchical',
        status: 'published',
        sourceId: 'es/development/what-is-json',
        localized: { es: { slug: 'que-es-json' } },
      },
      {
        articleId: 'what-is-json',
        locale: 'pt',
        primaryCategoryId: 'json-guides',
        strategy: 'hierarchical',
        status: 'published',
        sourceId: 'pt/development/what-is-json',
        localized: { pt: { slug: 'o-que-e-json' } },
      },
      {
        articleId: 'what-is-json',
        locale: 'fr',
        primaryCategoryId: 'json-guides',
        strategy: 'hierarchical',
        status: 'published',
        sourceId: 'fr/development/what-is-json',
        localized: { fr: { slug: 'qu-est-ce-que-json' } },
      },
    ]);
    expect(Object.isFrozen(definitions)).toBe(true);
    expect(Object.isFrozen(definitions[0]!.definition)).toBe(true);
    const firstDefinition = definitions[0];
    expect(firstDefinition?.kind).toBe('article');
    if (firstDefinition?.kind === 'article') {
      expect(Object.isFrozen(firstDefinition.definition.localized)).toBe(true);
    }
  });

  it('does not create a route for a locale with no published localized content', async () => {
    const provider = createArticleRouteProvider(async (locale) =>
      locale === 'es' ? [] : [articleEntry(locale)],
    );
    const registry = await createRouteRegistry({
      providers: [provider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(registry.getCanonical('es', { kind: 'article', articleId: 'what-is-json' })).toBeNull();
    expect(registry.getCanonical('en', { kind: 'article', articleId: 'what-is-json' })?.segments).toEqual([
      'blog',
      'development',
      'json-guides',
      'what-is-json',
    ]);
  });

  it('builds the exact hierarchical route matrix through the generic registry', async () => {
    const registry = await createRouteRegistry({
      providers: [articleRouteProvider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: publishEverything,
    });

    expect(
      registry.getAll().map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:blog/development/json-guides/what-is-json',
      'es:blog/desarrollo/guias-json/que-es-json',
      'pt:blog/desenvolvimento/guias-json/o-que-e-json',
      'fr:blog/developpement/guides-json/qu-est-ce-que-json',
    ]);
  });

  it('rejects invalid content-owned article route leaves', async () => {
    const provider = createArticleRouteProvider(async () => [
      articleEntry('en', 'What-Is-JSON'),
    ]);

    await expect(
      createRouteRegistry({
        providers: [provider],
        toolTaxonomy,
        blogTaxonomy,
        publicationAvailability: publishEverything,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_SEGMENT' });
  });
});

const publishEverything: RoutePublicationAvailability = {
  isPublishable: (_target: RouteTarget) => true,
};

function articleEntry(
  locale: Locale,
  routeSlug = locale === 'en' ? 'what-is-json' : `${locale}-what-is-json`,
): ArticleContentEntry {
  return {
    id: `blog/${locale}/development/what-is-json.md`,
    collection: 'blog',
    data: {
      articleId: 'what-is-json',
      locale,
      routeSlug,
      primaryCategoryId: 'json-guides',
      secondaryCategoryIds: [],
      status: 'published',
      title: 'What Is JSON',
      excerpt: 'A practical introduction to JSON.',
      seo: {
        title: 'What Is JSON',
        description: 'A practical introduction to JSON.',
        noindex: false,
      },
      publishedAt: new Date('2026-07-21T00:00:00.000Z'),
      relatedArticleIds: [],
      relatedToolIds: [],
    },
  } as unknown as ArticleContentEntry;
}
