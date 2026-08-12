import { describe, expect, it } from 'vitest';

import {
  RoutingInvariantError,
  createBlogStaticPaths,
  createRouteRegistry,
  createRootStaticPaths,
  createRouteRegistryFromRecords,
  createToolAreaStaticPaths,
  getBlogStaticPathEntries,
  getRootStaticPathEntries,
  getToolAreaStaticPathEntries,
  type RouteRegistry,
  type StaticPathFactory,
} from '@/routing';
import { blogTaxonomy } from '@/domain/taxonomy/blog/registry';
import { toolTaxonomy } from '@/domain/taxonomy/tools/registry';
import { getPublishedContentIndexes } from '@/content/queries';
import { toolRegistry } from '@/features/tools/registry';
import type { RouteRecord, RouteTarget } from '@/routing/types';

describe('static path factories', () => {
  it('projects root static paths for English and Spanish index routes', () => {
    const registry = fixtureRegistry();

    expect(getRootStaticPathEntries(registry, 'en')).toEqual([
      {
        params: {
          root: 'developer',
        },
        props: {
          routeTarget: {
            kind: 'tool-category',
            categoryId: 'developer',
          },
        },
      },
    ]);
    expect(getRootStaticPathEntries(registry, 'es')).toEqual([
      {
        params: {
          root: 'desarrollo',
        },
        props: {
          routeTarget: {
            kind: 'tool-category',
            categoryId: 'developer',
          },
        },
      },
    ]);
  });

  it('excludes tool records and nested category records from root projection', () => {
    const entries = getRootStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toHaveLength(1);
    expect(entries[0]?.props.routeTarget).toEqual({
      kind: 'tool-category',
      categoryId: 'developer',
    });
  });

  it('projects site-page records through the shared root projection', () => {
    const registry = createRouteRegistryFromRecords([
      sitePageRecord({
        locale: 'en',
        segments: ['contact'],
        pageId: 'contact',
      }),
      sitePageRecord({
        locale: 'es',
        segments: ['contacto'],
        pageId: 'contact',
      }),
    ]);

    expect(getRootStaticPathEntries(registry, 'en')).toEqual([
      {
        params: { root: 'contact' },
        props: {
          routeTarget: { kind: 'site-page', pageId: 'contact' },
        },
      },
    ]);
    expect(getRootStaticPathEntries(registry, 'es')).toEqual([
      {
        params: { root: 'contacto' },
        props: {
          routeTarget: { kind: 'site-page', pageId: 'contact' },
        },
      },
    ]);
  });

  it('excludes nested site-page records from the root projection', () => {
    const registry = createRouteRegistryFromRecords([
      sitePageRecord({
        locale: 'en',
        segments: ['legal', 'contact'],
        pageId: 'contact',
      }),
    ]);

    expect(getRootStaticPathEntries(registry, 'en')).toEqual([]);
  });

  it('rejects duplicate root params before Astro receives static paths', () => {
    const registry = rawRegistry([
      toolCategoryRecord({
        locale: 'en',
        segments: ['shared'],
        categoryId: 'developer',
      }),
      sitePageRecord({
        locale: 'en',
        segments: ['shared'],
        pageId: 'contact',
      }),
    ]);

    expectRouteError(
      () => getRootStaticPathEntries(registry, 'en'),
      'INVALID_STATIC_PATH_PROJECTION',
    );
  });

  it('projects root static paths from published category and site-page content', async () => {
    const registry = await createRouteRegistry({
      contentIndexes: await getPublishedContentIndexes(),
      toolRegistry,
      toolTaxonomy,
      blogTaxonomy,
    });

    expect(getRootStaticPathEntries(registry, 'en')).toEqual([
      {
        params: {
          root: 'developer',
        },
        props: {
          routeTarget: {
            kind: 'tool-category',
            categoryId: 'developer',
          },
        },
      },
      {
        params: {
          root: 'about',
        },
        props: {
          routeTarget: {
            kind: 'site-page',
            pageId: 'about',
          },
        },
      },
      {
        params: {
          root: 'contact',
        },
        props: {
          routeTarget: {
            kind: 'site-page',
            pageId: 'contact',
          },
        },
      },
      {
        params: {
          root: 'privacy',
        },
        props: {
          routeTarget: {
            kind: 'site-page',
            pageId: 'privacy',
          },
        },
      },
      {
        params: {
          root: 'terms',
        },
        props: {
          routeTarget: {
            kind: 'site-page',
            pageId: 'terms',
          },
        },
      },
    ]);
    expect(
      registry.getByTarget({
        kind: 'tool-category',
        categoryId: 'data-formats',
      }),
    ).toEqual([]);
    expect(
      registry.getByTarget({
        kind: 'tool-category',
        categoryId: 'json',
      }),
    ).toEqual([]);
  });

  it('projects flat and hierarchical tool-area catch-all paths', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'json-validator',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-validator',
        },
      },
    });
    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'data-formats/json/json-formatter',
      },
      props: {
        routeTarget: {
          kind: 'tool',
          toolId: 'json-formatter',
        },
      },
    });
  });

  it('projects Spanish tool-area paths without locale prefixes in params', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'es');

    expect(entries).toEqual([
      {
        params: {
          root: 'desarrollo',
          path: 'validador-json',
        },
        props: {
          routeTarget: {
            kind: 'tool',
            toolId: 'json-validator',
          },
        },
      },
    ]);
    expect(entries[0]?.params.root).not.toBe('es');
  });

  it('projects nested category landings through the tool-area catch-all', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        root: 'developer',
        path: 'formatters',
      },
      props: {
        routeTarget: {
          kind: 'tool-category',
          categoryId: 'formatters',
        },
      },
    });
  });

  it('excludes blog records from tool-area catch-all projection', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(
      entries.some((entry) => entry.props.routeTarget.kind === 'article'),
    ).toBe(false);
    expect(
      entries.some((entry) => entry.props.routeTarget.kind === 'blog-category'),
    ).toBe(false);
  });

  it('projects flat and hierarchical blog catch-all paths without duplicating blog', () => {
    const entries = getBlogStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toEqual([
      {
        params: {
          path: 'json-guides',
        },
        props: {
          routeTarget: {
            kind: 'blog-category',
            categoryId: 'json-guides',
          },
        },
      },
      {
        params: {
          path: 'what-is-json',
        },
        props: {
          routeTarget: {
            kind: 'article',
            articleId: 'what-is-json',
          },
        },
      },
      {
        params: {
          path: 'development/json-guides/json-best-practices',
        },
        props: {
          routeTarget: {
            kind: 'article',
            articleId: 'json-best-practices',
          },
        },
      },
    ]);
    expect(entries.map((entry) => entry.params.path)).not.toContain(
      'blog/what-is-json',
    );
  });

  it('projects Spanish blog catch-all paths', () => {
    expect(getBlogStaticPathEntries(fixtureRegistry(), 'es')).toEqual([
      {
        params: {
          path: 'que-es-json',
        },
        props: {
          routeTarget: {
            kind: 'article',
            articleId: 'what-is-json',
          },
        },
      },
    ]);
  });

  it('excludes blog root and tool records from blog catch-all projection', () => {
    const registry = createRouteRegistryFromRecords([
      blogCategoryRecord({
        locale: 'en',
        segments: ['blog'],
        categoryId: 'blog-root',
      }),
      toolRecord({
        locale: 'en',
        segments: ['developer', 'json-validator'],
        toolId: 'json-validator',
      }),
    ]);

    expect(getBlogStaticPathEntries(registry, 'en')).toEqual([]);
  });

  it('returns string params and stable route targets in props', () => {
    const [entry] = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(typeof entry?.params.root).toBe('string');
    expect(typeof entry?.params.path).toBe('string');
    expect(entry?.props.routeTarget).toEqual({
      kind: 'tool-category',
      categoryId: 'formatters',
    });
  });

  it('throws explicit projection errors for invalid blog namespace records', () => {
    const registry = rawRegistry([
      articleRecord({
        locale: 'en',
        segments: ['development', 'what-is-json'],
        articleId: 'what-is-json',
      }),
    ]);

    expectRouteError(
      () => getBlogStaticPathEntries(registry, 'en'),
      'INVALID_STATIC_PATH_PROJECTION',
    );
  });

  it('creates Astro-compatible factory functions from injected registries', async () => {
    const registry = fixtureRegistry();
    const rootPaths = await createRootStaticPaths({
      locale: 'en',
      getRegistry: () => registry,
    })(STATIC_PATH_OPTIONS);
    const toolPaths = await createToolAreaStaticPaths({
      locale: 'en',
      getRegistry: async () => registry,
    })(STATIC_PATH_OPTIONS);
    const blogPaths = await createBlogStaticPaths({
      locale: 'en',
      getRegistry: () => registry,
    })(STATIC_PATH_OPTIONS);

    expect(rootPaths).toHaveLength(1);
    expect(toolPaths).toHaveLength(3);
    expect(blogPaths).toHaveLength(3);
  });
});

const STATIC_PATH_OPTIONS = {} as Parameters<StaticPathFactory>[0];

function fixtureRegistry() {
  return createRouteRegistryFromRecords([
    toolCategoryRecord({
      locale: 'en',
      segments: ['developer'],
      categoryId: 'developer',
    }),
    toolCategoryRecord({
      locale: 'es',
      segments: ['desarrollo'],
      categoryId: 'developer',
    }),
    toolRecord({
      locale: 'en',
      segments: ['developer', 'json-validator'],
      toolId: 'json-validator',
    }),
    toolRecord({
      locale: 'es',
      segments: ['desarrollo', 'validador-json'],
      toolId: 'json-validator',
    }),
    toolRecord({
      locale: 'en',
      segments: ['developer', 'data-formats', 'json', 'json-formatter'],
      toolId: 'json-formatter',
    }),
    toolCategoryRecord({
      locale: 'en',
      segments: ['developer', 'formatters'],
      categoryId: 'formatters',
    }),
    articleRecord({
      locale: 'en',
      segments: ['blog', 'what-is-json'],
      articleId: 'what-is-json',
    }),
    articleRecord({
      locale: 'es',
      segments: ['blog', 'que-es-json'],
      articleId: 'what-is-json',
    }),
    articleRecord({
      locale: 'en',
      segments: ['blog', 'development', 'json-guides', 'json-best-practices'],
      articleId: 'json-best-practices',
    }),
    blogCategoryRecord({
      locale: 'en',
      segments: ['blog', 'json-guides'],
      categoryId: 'json-guides',
    }),
  ]);
}

function toolRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly toolId: string;
}): RouteRecord {
  return record({
    area: 'tools',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'tool',
      toolId: input.toolId,
    },
  });
}

function toolCategoryRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly categoryId: string;
}): RouteRecord {
  return record({
    area: 'tools',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'tool-category',
      categoryId: input.categoryId,
    },
  });
}

function articleRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly articleId: string;
}): RouteRecord {
  return record({
    area: 'blog',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'article',
      articleId: input.articleId,
    },
  });
}

function blogCategoryRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly categoryId: string;
}): RouteRecord {
  return record({
    area: 'blog',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'blog-category',
      categoryId: input.categoryId,
    },
  });
}

function sitePageRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly pageId: string;
}): RouteRecord {
  return record({
    area: 'site',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'site-page',
      pageId: input.pageId,
    },
  });
}

function record(input: {
  readonly area: RouteRecord['area'];
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly target: RouteTarget;
}): RouteRecord {
  return {
    ...input,
    sourceId: 'fixture:static-paths',
  };
}

function rawRegistry(records: readonly RouteRecord[]): RouteRegistry {
  return {
    getAll: () => records,
    findByPath: () => null,
    getCanonical: () => null,
    getByTarget: () => [],
  };
}

function expectRouteError(
  action: () => unknown,
  code: RoutingInvariantError['code'],
): void {
  expect(action).toThrow(RoutingInvariantError);

  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(RoutingInvariantError);
    expect((error as RoutingInvariantError).code).toBe(code);
  }
}
