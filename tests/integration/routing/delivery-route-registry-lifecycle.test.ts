import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock('@/content/queries/astro-content', () => ({
  getCollection: mocks.getCollection,
}));

import {
  AmbiguousContentError,
  createPublishedContentIndexes,
  getPublishedToolContent,
  resetPublishedContentIndexesForTesting,
  type ContentCollectionSource,
} from '@/content/queries';
import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import {
  createDeliveryRouteRegistryForTesting,
  getDeliveryRouteRegistry,
  resetDeliveryRouteRegistryForTesting,
} from '@/templates/composers/delivery-route-registry';

describe('delivery route registry content-index lifecycle', () => {
  beforeEach(() => {
    resetLifecycleState();
  });

  afterEach(() => {
    resetLifecycleState();
  });

  it('uses an injected published-content snapshot for route publication', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        tools: [publishedTool('en')],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const getPublishedContentIndexes = vi.fn(async () => indexes);

    mocks.getCollection.mockRejectedValue(
      new Error('Delivery routing should consume the injected snapshot.'),
    );

    const registry = await createDeliveryRouteRegistryForTesting({
      getPublishedContentIndexes,
    });

    expect(getPublishedContentIndexes).toHaveBeenCalledTimes(1);
    expect(mocks.getCollection).not.toHaveBeenCalled();
    expect(paths(registry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
    ]);
  });

  it('shares the default non-DEV published-content snapshot with content queries', async () => {
    vi.stubEnv('DEV', false);
    mockAstroCollections({
      tools: [
        publishedTool('en'),
        publishedTool('es'),
        publishedTool('pt'),
        publishedTool('fr'),
      ],
      toolCategories: [publishedToolCategory('en')],
    });

    const registry = await getDeliveryRouteRegistry();
    const content = await getPublishedToolContent('json-validator', 'en');

    expect(paths(registry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(content?.id).toBe('tools/en/developer/json-validator');
    expect(mocks.getCollection.mock.calls.map(([collection]) => collection))
      .toEqual(['tools', 'toolCategories', 'blog', 'blogCategories']);
  });

  it('preserves duplicate published-content diagnostics through route publication', async () => {
    const indexes = await createPublishedContentIndexes(
      contentSource({
        tools: [
          publishedTool('en'),
          entry('tools/en/duplicates/json-validator', {
            toolId: 'json-validator',
            locale: 'en',
            status: 'published',
          }),
        ],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const getPublishedContentIndexes = vi.fn(async () => indexes);
    let caughtError: unknown;

    try {
      await createDeliveryRouteRegistryForTesting({
        getPublishedContentIndexes,
      });
    } catch (error) {
      caughtError = error;
    }

    expect(getPublishedContentIndexes).toHaveBeenCalledTimes(1);
    expect(caughtError).toBeInstanceOf(AmbiguousContentError);
    expect((caughtError as AmbiguousContentError).context).toMatchObject({
      collection: 'tools',
      entityField: 'toolId',
      entityId: 'json-validator',
      locale: 'en',
      status: 'published',
      matchedEntryIds: [
        'tools/en/developer/json-validator',
        'tools/en/duplicates/json-validator',
      ],
    });
  });
});

type CollectionFixtures = Partial<
  Record<'tools' | 'toolCategories' | 'blog' | 'blogCategories', unknown[]>
>;

function resetLifecycleState(): void {
  resetDeliveryRouteRegistryForTesting();
  resetPublishedContentIndexesForTesting();
  vi.unstubAllEnvs();
  mocks.getCollection.mockReset();
}

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

function publishedTool(locale: Locale) {
  return entry(`tools/${locale}/developer/json-validator`, {
    toolId: 'json-validator',
    locale,
    status: 'published',
  });
}

function publishedToolCategory(locale: Locale) {
  return entry(`tool-categories/${locale}/developer`, {
    categoryId: 'developer',
    locale,
    status: 'published',
  });
}

function paths(registry: RouteRegistry): string[] {
  return registry
    .getAll()
    .map((record) => `${record.locale}:${record.segments.join('/')}`);
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
