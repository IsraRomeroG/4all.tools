import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock('@/content/queries/astro-content', () => ({
  getCollection: mocks.getCollection,
}));

import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { createIndexedPublicationAvailability } from '@/content/queries/indexed-publication-availability';
import {
  createPublishedContentIndexes,
  getPublishedContentIndexes,
  resetPublishedContentIndexesForTesting,
  type ContentCollectionSource,
} from '@/content/queries/indexed-content-source';
import { AmbiguousContentError } from '@/content/queries/errors';
import { createRouteRegistry } from '@/routing/registry';
import { toolCategoryRouteProvider } from '@/routing/providers/tool-category-route-provider';
import { toolRouteProvider } from '@/routing/providers/tool-route-provider';

afterEach(() => {
  resetPublishedContentIndexesForTesting();
  vi.unstubAllEnvs();
  mocks.getCollection.mockReset();
});

describe('published content indexes', () => {
  it('preserves exact-match semantics for zero, one, and duplicate entries', async () => {
    const source = contentSource({
      tools: [
        entry('tools/en/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'en',
          status: 'published',
        }),
        entry('tools/es/developer/json-validator-a', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'published',
        }),
        entry('tools/es/developer/json-validator-b', {
          toolId: 'json-validator',
          locale: 'es',
          status: 'published',
        }),
      ],
    });
    const indexes = await createPublishedContentIndexes(source);

    expect(indexes.tools.find({ toolId: 'missing-tool', locale: 'en' }))
      .toBeNull();
    expect(indexes.tools.find({ toolId: 'json-validator', locale: 'en' }))
      .toMatchObject({
        id: 'tools/en/developer/json-validator',
      });
    expect(() =>
      indexes.tools.find({ toolId: 'json-validator', locale: 'es' }),
    ).toThrow(AmbiguousContentError);

    try {
      indexes.tools.find({ toolId: 'json-validator', locale: 'es' });
    } catch (error) {
      expect((error as AmbiguousContentError).context).toMatchObject({
        collection: 'tools',
        entityField: 'toolId',
        entityId: 'json-validator',
        locale: 'es',
        status: 'published',
        matchedEntryIds: [
          'tools/es/developer/json-validator-a',
          'tools/es/developer/json-validator-b',
        ],
      });
    }
  });

  it('keeps locale keys separate and excludes draft or archived entries', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        tools: [
          entry('tools/en/developer/json-validator', {
            toolId: 'json-validator',
            locale: 'en',
            status: 'published',
          }),
          entry('tools/es/developer/json-validator', {
            toolId: 'json-validator',
            locale: 'es',
            status: 'draft',
          }),
          entry('tools/fr/developer/json-validator', {
            toolId: 'json-validator',
            locale: 'fr',
            status: 'archived',
          }),
        ],
      }),
    );

    expect(indexes.tools.find({ toolId: 'json-validator', locale: 'en' }))
      .toMatchObject({
        id: 'tools/en/developer/json-validator',
      });
    expect(indexes.tools.find({ toolId: 'json-validator', locale: 'es' }))
      .toBeNull();
    expect(indexes.tools.find({ toolId: 'json-validator', locale: 'fr' }))
      .toBeNull();
  });

  it('does not collide stable IDs with similar prefixes', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        tools: [
          entry('tools/en/developer/json', {
            toolId: 'json',
            locale: 'en',
            status: 'published',
          }),
          entry('tools/en/developer/json-validator', {
            toolId: 'json-validator',
            locale: 'en',
            status: 'published',
          }),
        ],
      }),
    );

    expect(indexes.tools.find({ toolId: 'json', locale: 'en' })?.id).toBe(
      'tools/en/developer/json',
    );
    expect(indexes.tools.find({ toolId: 'json-validator', locale: 'en' })?.id)
      .toBe('tools/en/developer/json-validator');
  });

  it('loads each indexed collection once per index creation', async () => {
    const source = contentSource();

    await createPublishedContentIndexes(source);

    expect(source.getCollection).toHaveBeenCalledTimes(4);
    expect(source.getCollection).toHaveBeenCalledWith('tools');
    expect(source.getCollection).toHaveBeenCalledWith('toolCategories');
    expect(source.getCollection).toHaveBeenCalledWith('blog');
    expect(source.getCollection).toHaveBeenCalledWith('blogCategories');
  });

  it('memoizes the default accessor outside DEV', async () => {
    vi.stubEnv('DEV', false);
    mockAstroCollections({
      tools: [
        entry('tools/en/developer/json-validator', {
          toolId: 'json-validator',
          locale: 'en',
          status: 'published',
        }),
      ],
    });

    const firstPromise = getPublishedContentIndexes();
    const secondPromise = getPublishedContentIndexes();
    const [firstIndexes, secondIndexes] = await Promise.all([
      firstPromise,
      secondPromise,
    ]);

    expect(secondPromise).toBe(firstPromise);
    expect(secondIndexes).toBe(firstIndexes);
    expect(mocks.getCollection.mock.calls.map(([collection]) => collection))
      .toEqual(['tools', 'toolCategories', 'blog', 'blogCategories']);
  });

  it('uses prepared indexes for route publication without repeated source loads', async () => {
    const source = contentSource({
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
      ],
      toolCategories: [
        entry('tool-categories/en/developer', {
          categoryId: 'developer',
          locale: 'en',
          status: 'published',
        }),
      ],
    });
    const indexes = await createPublishedContentIndexes(source);
    const registry = await createRouteRegistry({
      providers: [toolRouteProvider, toolCategoryRouteProvider],
      toolTaxonomy,
      blogTaxonomy,
      publicationAvailability: createIndexedPublicationAvailability(indexes),
    });

    expect(source.getCollection).toHaveBeenCalledTimes(4);
    expect(registry.getAll().map((record) => `${record.locale}:${record.segments.join('/')}`))
      .toEqual([
        'en:developer',
        'en:developer/json-validator',
        'es:desarrollo/validador-json',
        'pt:desenvolvedor/validador-json',
        'fr:developpement/validateur-json',
      ]);
  });
});

type CollectionFixtures = Partial<
  Record<'tools' | 'toolCategories' | 'blog' | 'blogCategories', unknown[]>
>;

function contentSource(fixtures: CollectionFixtures = {}): ContentCollectionSource {
  const collections: Required<CollectionFixtures> = {
    tools: fixtures.tools ?? [],
    toolCategories: fixtures.toolCategories ?? [],
    blog: fixtures.blog ?? [],
    blogCategories: fixtures.blogCategories ?? [],
  };
  const getCollection: ContentCollectionSource['getCollection'] = vi.fn(
    async (collection) =>
      collections[collection as keyof typeof collections] as never,
  );

  return {
    getCollection,
  };
}

function mockAstroCollections(fixtures: CollectionFixtures): void {
  const source = contentSource(fixtures);

  mocks.getCollection.mockImplementation(source.getCollection);
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
