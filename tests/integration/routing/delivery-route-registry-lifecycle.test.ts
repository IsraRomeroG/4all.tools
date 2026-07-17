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
import {
  createRouteRegistryFromRecords,
  type RouteRegistry,
} from '@/routing/registry';
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

  it('memoizes production registry creation', async () => {
    const registry = createRouteRegistryFromRecords([]);
    const createRegistry = vi.fn(async () => registry);
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();
    const [firstRegistry, secondRegistry] = await Promise.all([
      firstPromise,
      secondPromise,
    ]);

    expect(secondPromise).toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(1);
    expect(secondRegistry).toBe(firstRegistry);
    expect(firstRegistry).toBe(registry);
  });

  it('reconstructs the registry for each development access', async () => {
    const firstRegistry = createRouteRegistryFromRecords([]);
    const secondRegistry = createRouteRegistryFromRecords([]);
    const registries = [firstRegistry, secondRegistry];
    const createRegistry = vi.fn(async () => {
      const registry = registries.shift();

      if (registry === undefined) {
        throw new Error('Missing test registry.');
      }

      return registry;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();

    await expect(firstPromise).resolves.toBe(firstRegistry);
    await expect(secondPromise).resolves.toBe(secondRegistry);
    expect(secondPromise).not.toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(2);
  });

  it('observes changed route publication availability in development', async () => {
    const firstIndexes = await createPublishedContentIndexes(
      contentSource({
        tools: [publishedTool('en')],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const secondIndexes = await createPublishedContentIndexes(
      contentSource({
        tools: [publishedTool('en'), publishedTool('es')],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const snapshots = [firstIndexes, secondIndexes];
    const getPublishedContentIndexes = vi.fn(async () => {
      const indexes = snapshots.shift();

      if (indexes === undefined) {
        throw new Error('Missing test content snapshot.');
      }

      return indexes;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry: () =>
        createDeliveryRouteRegistryForTesting({
          getPublishedContentIndexes,
        }),
    });

    const firstRegistry = await getRegistry();
    const secondRegistry = await getRegistry();

    expect(paths(firstRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
    ]);
    expect(paths(secondRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
    ]);
    expect(getPublishedContentIndexes).toHaveBeenCalledTimes(2);
  });

  it('keeps the first production snapshot stable', async () => {
    const firstIndexes = await createPublishedContentIndexes(
      contentSource({
        tools: [publishedTool('en')],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const secondIndexes = await createPublishedContentIndexes(
      contentSource({
        tools: [publishedTool('en'), publishedTool('es')],
        toolCategories: [publishedToolCategory('en')],
      }),
    );
    const snapshots = [firstIndexes, secondIndexes];
    const getPublishedContentIndexes = vi.fn(async () => {
      const indexes = snapshots.shift();

      if (indexes === undefined) {
        throw new Error('Missing test content snapshot.');
      }

      return indexes;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry: () =>
        createDeliveryRouteRegistryForTesting({
          getPublishedContentIndexes,
        }),
    });

    const firstRegistry = await getRegistry();
    const secondRegistry = await getRegistry();

    expect(secondRegistry).toBe(firstRegistry);
    expect(paths(secondRegistry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
    ]);
    expect(getPublishedContentIndexes).toHaveBeenCalledTimes(1);
  });

  it('can recover from failed development registry creation', async () => {
    const failure = new Error('Failed test registry creation.');
    const registry = createRouteRegistryFromRecords([]);
    let attempt = 0;
    const createRegistry = vi.fn(async () => {
      attempt += 1;

      if (attempt === 1) {
        throw failure;
      }

      return registry;
    });
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: true,
      createRegistry,
    });

    await expect(getRegistry()).rejects.toBe(failure);
    await expect(getRegistry()).resolves.toBe(registry);
    expect(createRegistry).toHaveBeenCalledTimes(2);
  });

  it('shares concurrent production registry requests', async () => {
    const registry = createRouteRegistryFromRecords([]);
    const pending = deferred<RouteRegistry>();
    const createRegistry = vi.fn(() => pending.promise);
    const getRegistry = createDeliveryRouteRegistryAccessor({
      development: false,
      createRegistry,
    });

    const firstPromise = getRegistry();
    const secondPromise = getRegistry();
    const thirdPromise = getRegistry();

    expect(secondPromise).toBe(firstPromise);
    expect(thirdPromise).toBe(firstPromise);
    expect(createRegistry).toHaveBeenCalledTimes(1);

    pending.resolve(registry);

    await expect(firstPromise).resolves.toBe(registry);
    await expect(secondPromise).resolves.toBe(registry);
    await expect(thirdPromise).resolves.toBe(registry);
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return {
    promise,
    resolve,
  };
}

function entry(id: string, data: Record<string, unknown>) {
  return {
    id,
    collection: id.split('/')[0],
    data,
  };
}
