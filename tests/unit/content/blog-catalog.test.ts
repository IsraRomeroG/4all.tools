import { describe, expect, it, vi } from 'vitest';

import {
  createBlogContentQueries,
  createPublishedContentIndexes,
  type ContentCollectionSource,
} from '@/content/queries';
import { createDeliveryRouteRegistryForTesting } from '@/templates/composers/delivery-route-registry';

describe('published blog article catalog queries', () => {
  it('filters by locale and publication status, then orders deterministically', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        blog: [
          article('article-b', 'es', 'published', '2026-01-02T00:00:00.000Z'),
          article('article-a', 'es', 'published', '2026-01-02T00:00:00.000Z'),
          article('article-new', 'es', 'published', '2026-01-03T00:00:00.000Z'),
          article('english-only', 'en', 'published', '2026-01-04T00:00:00.000Z'),
          article('draft', 'es', 'draft', '2026-04-01T00:00:00.000Z'),
          article('archived', 'es', 'archived', '2026-04-02T00:00:00.000Z'),
        ],
      }),
    );
    const queries = createBlogContentQueries({
      getPublishedContentIndexes: async () => indexes,
    });

    expect((await queries.listPublishedArticleContent('es')).map(articleId)).toEqual([
      'article-new',
      'article-a',
      'article-b',
    ]);
    expect(await queries.listPublishedArticleContent('fr')).toEqual([]);
    expect(Object.isFrozen(await queries.listPublishedArticleContent('fr'))).toBe(true);
  });

  it('rejects structural mutation without changing the authoritative list', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        blog: [article('article-a', 'en', 'published', '2026-01-01T00:00:00.000Z')],
      }),
    );
    const queries = createBlogContentQueries({
      getPublishedContentIndexes: async () => indexes,
    });
    const list = await queries.listPublishedArticleContent('en');
    const mutableList = list as unknown as unknown[];

    expect(() => mutableList.push('unexpected')).toThrow(TypeError);
    expect((await queries.listPublishedArticleContent('en')).map(articleId)).toEqual([
      'article-a',
    ]);
  });

  it('fails listing when the requested locale has duplicate published identities', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        blog: [
          article('duplicate', 'es', 'published', '2026-01-01T00:00:00.000Z', 'one'),
          article('duplicate', 'es', 'published', '2026-01-01T00:00:00.000Z', 'two'),
        ],
      }),
    );
    const queries = createBlogContentQueries({
      getPublishedContentIndexes: async () => indexes,
    });

    await expect(queries.listPublishedArticleContent('es')).rejects.toMatchObject({
      code: 'AMBIGUOUS_CONTENT',
    });
  });

  it('shares one injected published snapshot with routing and exact queries', async () => {
    const source = contentSource({
      blog: [article('what-is-json', 'en', 'published', '2026-01-01T00:00:00.000Z')],
      blogCategories: [blogCategory('json-guides', 'en')],
    });
    const snapshot = createPublishedContentIndexes(source);
    const getPublishedContentIndexes = vi.fn(() => snapshot);
    const queries = createBlogContentQueries({ getPublishedContentIndexes });

    await createDeliveryRouteRegistryForTesting({ getPublishedContentIndexes });
    await queries.listPublishedArticleContent('en');
    await queries.requirePublishedArticleContent('what-is-json', 'en');
    await queries.requirePublishedBlogCategoryContent('json-guides', 'en');

    expect(source.getCollection).toHaveBeenCalledTimes(4);
    expect(source.getCollection).toHaveBeenCalledWith('blog');
    expect(getPublishedContentIndexes).toHaveBeenCalledTimes(4);
  });
});

function contentSource(fixtures: {
  readonly blog?: readonly unknown[];
  readonly blogCategories?: readonly unknown[];
}): ContentCollectionSource & { readonly getCollection: ReturnType<typeof vi.fn> } {
  const collections = {
    tools: [],
    toolCategories: [],
    blog: [...(fixtures.blog ?? [])],
    blogCategories: [...(fixtures.blogCategories ?? [])],
  };
  const getCollection = vi.fn(async (collection: keyof typeof collections) =>
    collections[collection] as never,
  );

  return { getCollection };
}

function article(
  articleId: string,
  locale: string,
  status: string,
  publishedAt: string,
  suffix = articleId,
) {
  return {
    id: `blog/${locale}/${articleId}/${suffix}`,
    collection: 'blog',
    data: {
      articleId,
      locale,
      status,
      publishedAt: new Date(publishedAt),
    },
  };
}

function blogCategory(categoryId: string, locale: string) {
  return {
    id: `blog-categories/${locale}/${categoryId}`,
    collection: 'blogCategories',
    data: {
      categoryId,
      locale,
      status: 'published',
    },
  };
}

function articleId(entry: { readonly data: { readonly articleId: string } }): string {
  return entry.data.articleId;
}
