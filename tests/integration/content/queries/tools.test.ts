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
  resetPublishedContentIndexesForTesting,
  getPublishedBlogCategoryContent,
  getPublishedToolCategoryContent,
  getPublishedToolContent,
  requirePublishedToolContent,
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

describe('tool content query services', () => {
  beforeEach(() => {
    resetPublishedContentIndexesForTesting();

    collections = {
      tools: [
        entry('tools/en/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'en',
          status: 'published',
        }),
        entry('tools/es/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'published',
        }),
        entry('tools/pt/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'pt',
          status: 'published',
        }),
        entry('tools/fr/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'fr',
          status: 'published',
        }),
        entry('tools/es/drafts/json-validator', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'draft',
        }),
        entry('tools/en/developer/only-english', {
          toolId: 'only-english',
          locale: 'en',
          status: 'published',
        }),
      ],
      toolCategories: [
        entry('tool-categories/en/developer', {
          categoryId: 'developer',
          locale: 'en',
          status: 'published',
        }),
        entry('tool-categories/en/shared', {
          categoryId: 'shared',
          locale: 'en',
          status: 'published',
        }),
      ],
      blogCategories: [
        entry('blog-categories/en/shared', {
          categoryId: 'shared',
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

  it('finds English published tool content by ToolId and locale', async () => {
    await expect(getPublishedToolContent('json-validator', 'en')).resolves.toMatchObject({
      id: 'tools/en/developer/json-validator',
      data: {
        toolId: 'json-validator',
        locale: 'en',
      },
    });
  });

  it('finds Spanish published tool content separately from English', async () => {
    await expect(getPublishedToolContent('json-validator', 'es')).resolves.toMatchObject({
      id: 'tools/es/developer/json-validator',
      data: {
        toolId: 'json-validator',
        locale: 'es',
      },
    });
  });

  it('finds one published json-validator entry for each supported locale', async () => {
    for (const locale of ['en', 'es', 'pt', 'fr'] as const) {
      await expect(getPublishedToolContent('json-validator', locale)).resolves.toMatchObject({
        id: `tools/${locale}/developer/json-validator`,
        data: {
          toolId: 'json-validator',
          locale,
          status: 'published',
        },
      });
    }
  });

  it('throws not found for required missing tool content', async () => {
    await expect(requirePublishedToolContent('missing-tool', 'fr')).rejects.toThrow(
      ContentNotFoundError,
    );
  });

  it('does not fall back to English when the requested locale is missing', async () => {
    await expect(getPublishedToolContent('only-english', 'es')).resolves.toBeNull();
  });

  it('filters drafts before resolving published cardinality', async () => {
    await expect(getPublishedToolContent('json-validator', 'es')).resolves.toMatchObject({
      id: 'tools/es/developer/json-validator',
    });
  });

  it('rebuilds default indexes in dev/test so content changes are visible', async () => {
    await expect(getPublishedToolContent('new-tool', 'en')).resolves.toBeNull();

    mutableCollection('tools').push(
      entry('tools/en/developer/new-tool', {
        toolId: 'new-tool',
        locale: 'en',
        status: 'published',
      }),
    );

    await expect(getPublishedToolContent('new-tool', 'en')).resolves.toMatchObject({
      id: 'tools/en/developer/new-tool',
    });
  });

  it('throws ambiguity for duplicate published tool content in one locale', async () => {
    mutableCollection('tools').push(
      entry('tools/es/duplicate/json-validator', {
        toolId: 'json-validator',
        locale: 'es',
        status: 'published',
      }),
    );

    await expect(getPublishedToolContent('json-validator', 'es')).rejects.toThrow(
      AmbiguousContentError,
    );
  });

  it('includes diagnostic context for duplicate published tool content', async () => {
    mutableCollection('tools').push(
      entry('tools/es/duplicate/json-validator', {
        toolId: 'json-validator',
        locale: 'es',
        status: 'published',
      }),
    );

    try {
      await getPublishedToolContent('json-validator', 'es');
      throw new Error('Expected duplicate content to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(AmbiguousContentError);
      expect((error as AmbiguousContentError).context).toMatchObject({
        collection: 'tools',
        entityField: 'toolId',
        entityId: 'json-validator',
        locale: 'es',
        status: 'published',
        matchedEntryIds: [
          'tools/es/developer/json-validator',
          'tools/es/duplicate/json-validator',
        ],
      });
    }
  });

  it('keeps tool-category and blog-category lookups separated', async () => {
    await expect(getPublishedToolCategoryContent('shared', 'en')).resolves.toMatchObject({
      id: 'tool-categories/en/shared',
    });
    await expect(getPublishedBlogCategoryContent('shared', 'en')).resolves.toMatchObject({
      id: 'blog-categories/en/shared',
    });
  });
});
