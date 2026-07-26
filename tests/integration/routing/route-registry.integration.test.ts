import { describe, expect, it } from 'vitest';

import {
  createPublishedContentIndexes,
  getPublishedContentIndexes,
  type ContentCollectionSource,
  type ArticleContentEntry,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { createRouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';
import { toolRegistry } from '@/features/tools/registry';

describe('route registry integration', () => {
  it('preserves the normalized pre-P15 public route snapshot', async () => {
    const registry = await createRouteRegistry({
      contentIndexes: await getPublishedContentIndexes(),
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(registry.getAll().map(normalize)).toEqual(PRE_P15_ROUTE_SNAPSHOT);
  });

  it('keeps a missing localized article content route absent without fallback', async () => {
    const indexes = await createPublishedContentIndexes(source({
      blog: [article('en', 'what-is-json', 'what-is-json')],
    }));
    const registry = await createRouteRegistry({
      contentIndexes: indexes,
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(registry.getCanonical('en', { kind: 'article', articleId: 'what-is-json' })).not.toBeNull();
    expect(registry.getCanonical('es', { kind: 'article', articleId: 'what-is-json' })).toBeNull();
  });

  it('rejects duplicate localized article paths through route validation', async () => {
    const indexes = await createPublishedContentIndexes(source({
      blog: [
        article('en', 'first-article', 'shared'),
        article('en', 'second-article', 'shared'),
      ],
    }));

    await expect(
      createRouteRegistry({
        contentIndexes: indexes,
        toolRegistry,
        toolTaxonomy,
        blogTaxonomy,
      }),
    ).rejects.toMatchObject({ code: 'DUPLICATE_PUBLIC_PATH' });
  });

  it('keeps route output deterministic across repeated construction', async () => {
    const indexes = await getPublishedContentIndexes();
    const first = await createRouteRegistry({ contentIndexes: indexes, toolRegistry, toolTaxonomy, blogTaxonomy });
    const second = await createRouteRegistry({ contentIndexes: indexes, toolRegistry, toolTaxonomy, blogTaxonomy });

    expect(second.getAll()).toEqual(first.getAll());
  });
});

function normalize(record: RouteRecord): Omit<RouteRecord, 'sourceId'> {
  return {
    area: record.area,
    locale: record.locale,
    segments: [...record.segments],
    target: { ...record.target },
  };
}

const PRE_P15_ROUTE_SNAPSHOT = [
  { area: 'tools', locale: 'en', segments: ['developer'], target: { kind: 'tool-category', categoryId: 'developer' } },
  { area: 'tools', locale: 'en', segments: ['developer', 'json-validator'], target: { kind: 'tool', toolId: 'json-validator' } },
  { area: 'blog', locale: 'en', segments: ['blog', 'development'], target: { kind: 'blog-category', categoryId: 'development' } },
  { area: 'blog', locale: 'en', segments: ['blog', 'development', 'json-guides'], target: { kind: 'blog-category', categoryId: 'json-guides' } },
  { area: 'blog', locale: 'en', segments: ['blog', 'development', 'json-guides', 'what-is-json'], target: { kind: 'article', articleId: 'what-is-json' } },
  { area: 'tools', locale: 'es', segments: ['desarrollo', 'validador-json'], target: { kind: 'tool', toolId: 'json-validator' } },
  { area: 'blog', locale: 'es', segments: ['blog', 'desarrollo'], target: { kind: 'blog-category', categoryId: 'development' } },
  { area: 'blog', locale: 'es', segments: ['blog', 'desarrollo', 'guias-json'], target: { kind: 'blog-category', categoryId: 'json-guides' } },
  { area: 'blog', locale: 'es', segments: ['blog', 'desarrollo', 'guias-json', 'que-es-json'], target: { kind: 'article', articleId: 'what-is-json' } },
  { area: 'tools', locale: 'pt', segments: ['desenvolvedor', 'validador-json'], target: { kind: 'tool', toolId: 'json-validator' } },
  { area: 'blog', locale: 'pt', segments: ['blog', 'desenvolvimento'], target: { kind: 'blog-category', categoryId: 'development' } },
  { area: 'blog', locale: 'pt', segments: ['blog', 'desenvolvimento', 'guias-json'], target: { kind: 'blog-category', categoryId: 'json-guides' } },
  { area: 'blog', locale: 'pt', segments: ['blog', 'desenvolvimento', 'guias-json', 'o-que-e-json'], target: { kind: 'article', articleId: 'what-is-json' } },
  { area: 'tools', locale: 'fr', segments: ['developpement', 'validateur-json'], target: { kind: 'tool', toolId: 'json-validator' } },
  { area: 'blog', locale: 'fr', segments: ['blog', 'developpement'], target: { kind: 'blog-category', categoryId: 'development' } },
  { area: 'blog', locale: 'fr', segments: ['blog', 'developpement', 'guides-json'], target: { kind: 'blog-category', categoryId: 'json-guides' } },
  { area: 'blog', locale: 'fr', segments: ['blog', 'developpement', 'guides-json', 'qu-est-ce-que-json'], target: { kind: 'article', articleId: 'what-is-json' } },
] as const;

function source(fixtures: { readonly blog?: readonly ArticleContentEntry[] }): ContentCollectionSource {
  return {
    getCollection: async (collection) => {
      if (collection === 'blog') {
        return (fixtures.blog ?? []) as never;
      }

      return [] as never;
    },
  };
}

function article(locale: 'en' | 'es' | 'pt' | 'fr', articleId: string, routeSlug: string): ArticleContentEntry {
  return {
    id: `blog/${locale}/${articleId}`,
    collection: 'blog',
    data: {
      articleId,
      locale,
      routeSlug,
      primaryCategoryId: 'json-guides',
      secondaryCategoryIds: [],
      status: 'published',
      title: articleId,
      excerpt: articleId,
      seo: { title: articleId, description: articleId, noindex: false },
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      relatedArticleIds: [],
      relatedToolIds: [],
    },
  } as unknown as ArticleContentEntry;
}
