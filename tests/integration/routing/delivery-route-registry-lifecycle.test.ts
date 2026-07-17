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
  createDeliveryRouteRegistryAccessor,
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

  it('spans mutable source changes across DEV and production lifecycle boundaries', async () => {
    const source = createMutableTestContentSource({
      tools: [publishedTool('en'), publishedTool('pt'), publishedTool('fr')],
      toolCategories: [publishedToolCategory('en')],
    });
    const createRegistryFromCurrentSource = () =>
      createDeliveryRouteRegistryForTesting({
        getPublishedContentIndexes: () => createPublishedContentIndexes(source),
      });
    const createDevelopmentRegistry = vi.fn(createRegistryFromCurrentSource);
    const createProductionRegistry = vi.fn(createRegistryFromCurrentSource);
    const developmentRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry: createDevelopmentRegistry,
    });
    const productionRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry: createProductionRegistry,
    });

    const firstDevelopmentRegistry = await developmentRegistry();
    const firstProductionRegistry = await productionRegistry();

    expect(paths(firstDevelopmentRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(paths(firstProductionRegistry)).toEqual(
      paths(firstDevelopmentRegistry),
    );
    expectLoadCounters(source.counters, 2);

    source.replace({
      tools: [
        publishedTool('en'),
        publishedTool('es'),
        publishedTool('pt'),
        publishedTool('fr'),
      ],
      toolCategories: [publishedToolCategory('en')],
    });

    const secondDevelopmentRegistry = await developmentRegistry();
    const secondProductionRegistry = await productionRegistry();

    expect(paths(secondDevelopmentRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(secondProductionRegistry).toBe(firstProductionRegistry);
    expect(paths(secondProductionRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expect(createDevelopmentRegistry).toHaveBeenCalledTimes(2);
    expect(createProductionRegistry).toHaveBeenCalledTimes(1);
    expectLoadCounters(source.counters, 3);

    const newProductionRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry: createRegistryFromCurrentSource,
    });
    const updatedProductionRegistry = await newProductionRegistry();

    expect(paths(updatedProductionRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
      'pt:desenvolvedor/validador-json',
      'fr:developpement/validateur-json',
    ]);
    expectLoadCounters(source.counters, 4);
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
  Record<CollectionName, unknown[]>
>;

type CollectionName = keyof CollectionLoadCounters;

interface CollectionLoadCounters {
  tools: number;
  toolCategories: number;
  blog: number;
  blogCategories: number;
}

interface MutableTestContentSource extends ContentCollectionSource {
  readonly counters: CollectionLoadCounters;
  replace(fixtures: CollectionFixtures): void;
}

function resetLifecycleState(): void {
  resetDeliveryRouteRegistryForTesting();
  resetPublishedContentIndexesForTesting();
  vi.unstubAllEnvs();
  mocks.getCollection.mockReset();
}

function contentSource(fixtures: CollectionFixtures = {}): ContentCollectionSource {
  return createMutableTestContentSource(fixtures);
}

function createMutableTestContentSource(
  fixtures: CollectionFixtures = {},
): MutableTestContentSource {
  let collections = normalizeCollectionFixtures(fixtures);
  const counters: CollectionLoadCounters = {
    tools: 0,
    toolCategories: 0,
    blog: 0,
    blogCategories: 0,
  };
  const getCollection: ContentCollectionSource['getCollection'] = vi.fn(
    async (collection) => {
      const collectionName = collection as CollectionName;

      counters[collectionName] += 1;

      return [...collections[collectionName]] as never;
    },
  );

  return {
    counters,
    getCollection,
    replace: (nextFixtures) => {
      collections = normalizeCollectionFixtures(nextFixtures);
    },
  };
}

function normalizeCollectionFixtures(fixtures: CollectionFixtures) {
  const collections: Required<CollectionFixtures> = {
    tools: fixtures.tools ?? [],
    toolCategories: fixtures.toolCategories ?? [],
    blog: fixtures.blog ?? [],
    blogCategories: fixtures.blogCategories ?? [],
  };

  return collections;
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

function expectLoadCounters(
  counters: CollectionLoadCounters,
  expected: number,
): void {
  expect(counters).toEqual({
    tools: expected,
    toolCategories: expected,
    blog: expected,
    blogCategories: expected,
  });
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
