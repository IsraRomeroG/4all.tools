import { describe, expect, it } from 'vitest';

import {
  createPublishedContentIndexes,
  getPublishedContentIndexes,
  type ContentCollectionSource,
  type ArticleContentEntry,
  type SitePageContentEntry,
} from '@/content/queries';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { createRouteRegistry } from '@/routing/registry';
import { toolRegistry } from '@/features/tools/registry';

describe('route registry integration', () => {
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

  it('derives localized site-page routes from exact published content', async () => {
    const indexes = await createPublishedContentIndexes(source({
      sitePages: [
        sitePage('en', 'contact', 'contact'),
        sitePage('es', 'contact', 'contacto'),
        sitePage('pt', 'contact', 'contato', 'draft'),
      ],
    }));
    const registry = await createRouteRegistry({
      contentIndexes: indexes,
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(registry.getCanonical('en', { kind: 'site-page', pageId: 'contact' })).toMatchObject({
      area: 'site',
      segments: ['contact'],
      sourceId: 'site-page-content:site-pages/en/contact',
    });
    expect(registry.getCanonical('es', { kind: 'site-page', pageId: 'contact' })?.segments)
      .toEqual(['contacto']);
    expect(registry.getCanonical('pt', { kind: 'site-page', pageId: 'contact' })).toBeNull();
  });
});

function source(fixtures: {
  readonly blog?: readonly ArticleContentEntry[];
  readonly sitePages?: readonly SitePageContentEntry[];
}): ContentCollectionSource {
  return {
    getCollection: async (collection) => {
      if (collection === 'blog') {
        return (fixtures.blog ?? []) as never;
      }

      if (collection === 'sitePages') {
        return (fixtures.sitePages ?? []) as never;
      }

      return [] as never;
    },
  };
}

function sitePage(
  locale: 'en' | 'es' | 'pt' | 'fr',
  pageId: string,
  routeSlug: string,
  status: 'published' | 'draft' = 'published',
): SitePageContentEntry {
  return {
    id: `site-pages/${locale}/${pageId}`,
    collection: 'sitePages',
    data: {
      pageId,
      locale,
      routeSlug,
      status,
      title: pageId,
      seo: { title: pageId, description: pageId, noindex: false },
    },
  } as unknown as SitePageContentEntry;
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
