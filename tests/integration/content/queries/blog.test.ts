import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock('@/content/queries/astro-content', () => ({
  getCollection: mocks.getCollection,
}));

import {
  AmbiguousContentError,
  ContentNotFoundError,
  getPublishedArticleContent,
  getPublishedBlogCategoryContent,
  requirePublishedArticleContent,
} from '@/content/queries';

interface TestEntry {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

type TestCollections = Record<string, TestEntry[]>;

let collections: TestCollections;

function entry(id: string, data: Record<string, unknown>): TestEntry {
  return { id, data };
}

function mutableCollection(name: string): TestEntry[] {
  const entries = collections[name];

  if (entries === undefined) {
    throw new Error(`Missing test collection ${name}.`);
  }

  return entries;
}

describe('blog content query services', () => {
  beforeEach(() => {
    collections = {
      blog: [
        entry('blog/en/development/what-is-json', {
          articleId: 'what-is-json',
          locale: 'en',
          status: 'published',
        }),
        entry('blog/es/development/what-is-json', {
          articleId: 'what-is-json',
          locale: 'es',
          status: 'published',
        }),
        entry('blog/es/drafts/what-is-json', {
          articleId: 'what-is-json',
          locale: 'es',
          status: 'draft',
        }),
        entry('blog/en/development/only-english', {
          articleId: 'only-english',
          locale: 'en',
          status: 'published',
        }),
      ],
      blogCategories: [
        entry('blog-categories/en/json-guides', {
          categoryId: 'json-guides',
          locale: 'en',
          status: 'published',
        }),
      ],
    };

    mocks.getCollection.mockImplementation(
      async (
        collection: string,
        filter?: (entry: TestEntry) => boolean,
      ): Promise<TestEntry[]> => {
        const entries = collections[collection] ?? [];

        return filter === undefined ? entries : entries.filter(filter);
      },
    );
  });

  it('finds a published article by ArticleId and locale', async () => {
    await expect(getPublishedArticleContent('what-is-json', 'en')).resolves.toMatchObject({
      id: 'blog/en/development/what-is-json',
      data: {
        articleId: 'what-is-json',
        locale: 'en',
      },
    });
  });

  it('resolves the same ArticleId separately across locales', async () => {
    await expect(getPublishedArticleContent('what-is-json', 'es')).resolves.toMatchObject({
      id: 'blog/es/development/what-is-json',
      data: {
        articleId: 'what-is-json',
        locale: 'es',
      },
    });
  });

  it('returns null for a missing article translation', async () => {
    await expect(getPublishedArticleContent('what-is-json', 'fr')).resolves.toBeNull();
  });

  it('throws not found for required missing article translation', async () => {
    await expect(requirePublishedArticleContent('what-is-json', 'fr')).rejects.toThrow(
      ContentNotFoundError,
    );
  });

  it('does not fall back to English article content', async () => {
    await expect(getPublishedArticleContent('only-english', 'es')).resolves.toBeNull();
  });

  it('filters drafts before resolving published article cardinality', async () => {
    await expect(getPublishedArticleContent('what-is-json', 'es')).resolves.toMatchObject({
      id: 'blog/es/development/what-is-json',
    });
  });

  it('throws ambiguity for duplicate published article translations', async () => {
    mutableCollection('blog').push(
      entry('blog/es/duplicate/what-is-json', {
        articleId: 'what-is-json',
        locale: 'es',
        status: 'published',
      }),
    );

    await expect(getPublishedArticleContent('what-is-json', 'es')).rejects.toThrow(
      AmbiguousContentError,
    );
  });

  it('includes diagnostic context for duplicate article translations', async () => {
    mutableCollection('blog').push(
      entry('blog/es/duplicate/what-is-json', {
        articleId: 'what-is-json',
        locale: 'es',
        status: 'published',
      }),
    );

    try {
      await getPublishedArticleContent('what-is-json', 'es');
      throw new Error('Expected duplicate content to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(AmbiguousContentError);
      expect((error as AmbiguousContentError).context).toMatchObject({
        collection: 'blog',
        entityField: 'articleId',
        entityId: 'what-is-json',
        locale: 'es',
        matchedEntryIds: [
          'blog/es/development/what-is-json',
          'blog/es/duplicate/what-is-json',
        ],
      });
    }
  });

  it('finds published blog-category content by BlogCategoryId and locale', async () => {
    await expect(getPublishedBlogCategoryContent('json-guides', 'en')).resolves.toMatchObject({
      id: 'blog-categories/en/json-guides',
      data: {
        categoryId: 'json-guides',
        locale: 'en',
      },
    });
  });
});
