import { describe, expect, it } from 'vitest';

import {
  RoutingInvariantError,
  createBlogStaticPaths,
  createRootCategoryStaticPaths,
  createRouteRegistryFromRecords,
  createToolAreaStaticPaths,
  getBlogStaticPathEntries,
  getRootCategoryStaticPathEntries,
  getToolAreaStaticPathEntries,
  type StaticPathFactory,
} from '@/routing';
import type { RouteRecord, RouteTarget } from '@/routing/types';

describe('static path factories', () => {
  it('projects root category static paths for English and Spanish index routes', () => {
    const registry = fixtureRegistry();

    expect(getRootCategoryStaticPathEntries(registry, 'en')).toEqual([
      {
        params: {
          category: 'developer',
        },
        props: {
          routeTarget: {
            kind: 'tool-category',
            categoryId: 'developer',
          },
        },
      },
    ]);
    expect(getRootCategoryStaticPathEntries(registry, 'es')).toEqual([
      {
        params: {
          category: 'desarrollo',
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

  it('excludes tool records and nested category records from root category projection', () => {
    const entries = getRootCategoryStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toHaveLength(1);
    expect(entries[0]?.props.routeTarget).toEqual({
      kind: 'tool-category',
      categoryId: 'developer',
    });
  });

  it('projects flat and hierarchical tool-area catch-all paths', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        category: 'developer',
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
        category: 'developer',
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
          category: 'desarrollo',
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
    expect(entries[0]?.params.category).not.toBe('es');
  });

  it('projects nested category landings through the tool-area catch-all', () => {
    const entries = getToolAreaStaticPathEntries(fixtureRegistry(), 'en');

    expect(entries).toContainEqual({
      params: {
        category: 'developer',
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

    expect(typeof entry?.params.category).toBe('string');
    expect(typeof entry?.params.path).toBe('string');
    expect(entry?.props.routeTarget).toEqual({
      kind: 'tool-category',
      categoryId: 'formatters',
    });
  });

  it('throws explicit projection errors for invalid blog namespace records', () => {
    const registry = createRouteRegistryFromRecords([
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
    const rootPaths = await createRootCategoryStaticPaths({
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
