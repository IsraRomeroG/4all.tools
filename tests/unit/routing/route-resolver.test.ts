import { describe, expect, it } from 'vitest';

import {
  RoutingInvariantError,
  createRouteRegistryFromRecords,
  createRouteResolver,
  getRouteTargetKey,
} from '@/routing';
import type { RouteRecord, RouteTarget } from '@/routing/types';

describe('route resolver', () => {
  it('resolves exact English and Spanish tool paths to one stable target', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['developer', 'json-validator'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'es',
          segments: ['desarrollo', 'validador-json'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
  });

  it('respects locale when the same raw path text exists in different locales', () => {
    const resolver = createRouteResolver(
      createRouteRegistryFromRecords([
        articleRecord({
          locale: 'en',
          segments: ['blog', 'json'],
          articleId: 'json-article-en',
        }),
        articleRecord({
          locale: 'es',
          segments: ['blog', 'json'],
          articleId: 'json-article-es',
        }),
      ]),
    );

    expect(
      getRouteTargetKey(
        resolver.resolve({ locale: 'en', segments: ['blog', 'json'] })
          ?.target ?? missingTarget(),
      ),
    ).toBe('article:json-article-en');
    expect(
      getRouteTargetKey(
        resolver.resolve({ locale: 'es', segments: ['blog', 'json'] })
          ?.target ?? missingTarget(),
      ),
    ).toBe('article:json-article-es');
  });

  it('returns null for unknown paths and throws typed errors for required paths', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expect(
      resolver.resolve({
        locale: 'en',
        segments: ['developer', 'not-a-tool'],
      }),
    ).toBeNull();
    expectRouteError(
      () =>
        resolver.requireResolved({
          locale: 'en',
          segments: ['developer', 'not-a-tool'],
        }),
      'UNKNOWN_ROUTE',
    );
  });

  it('rejects malformed path segments without normalization', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expectRouteError(
      () =>
        resolver.resolve({
          locale: 'en',
          segments: ['Developer', 'JSON-Validator'],
        }),
      'INVALID_SEGMENT',
    );
  });

  it('looks up canonical target routes without locale fallback', () => {
    const resolver = createRouteResolver(fixtureRegistry());
    const target = {
      kind: 'tool',
      toolId: 'json-validator',
    } satisfies RouteTarget;

    expect(
      resolver.getCanonical({
        locale: 'en',
        target,
      })?.segments,
    ).toEqual(['developer', 'json-validator']);
    expect(
      resolver.getCanonical({
        locale: 'es',
        target,
      })?.segments,
    ).toEqual(['desarrollo', 'validador-json']);
    expect(
      resolver.getCanonical({
        locale: 'pt',
        target,
      }),
    ).toBeNull();
    expectRouteError(
      () =>
        resolver.requireCanonical({
          locale: 'pt',
          target,
        }),
      'MISSING_LOCALIZED_ROUTE',
    );
  });

  it('returns deterministic alternates for the same stable target', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expect(
      resolver
        .getAlternates({
          kind: 'tool',
          toolId: 'json-validator',
        })
        .map((record) => `${record.locale}:${record.segments.join('/')}`),
    ).toEqual([
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
    ]);
  });

  it('does not infer target kind from path depth', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['developer', 'formatters'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool-category:formatters');
    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['developer', 'json-validator'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
  });

  it('resolves blog articles and blog categories through registry ownership', () => {
    const resolver = createRouteResolver(fixtureRegistry());

    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['blog', 'what-is-json'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('article:what-is-json');
    expect(
      getRouteTargetKey(
        resolver.resolve({
          locale: 'en',
          segments: ['blog', 'json-guides'],
        })?.target ?? missingTarget(),
      ),
    ).toBe('blog-category:json-guides');
  });

  it('keeps identical raw IDs distinct across target kinds', () => {
    const resolver = createRouteResolver(
      createRouteRegistryFromRecords([
        toolRecord({
          locale: 'en',
          segments: ['developer', 'json-validator'],
          toolId: 'json-validator',
        }),
        articleRecord({
          locale: 'en',
          segments: ['blog', 'json-validator'],
          articleId: 'json-validator',
        }),
      ]),
    );

    expect(
      getRouteTargetKey(
        resolver.getCanonical({
          locale: 'en',
          target: {
            kind: 'tool',
            toolId: 'json-validator',
          },
        })?.target ?? missingTarget(),
      ),
    ).toBe('tool:json-validator');
    expect(
      getRouteTargetKey(
        resolver.getCanonical({
          locale: 'en',
          target: {
            kind: 'article',
            articleId: 'json-validator',
          },
        })?.target ?? missingTarget(),
      ),
    ).toBe('article:json-validator');
  });
});

function fixtureRegistry() {
  return createRouteRegistryFromRecords([
    toolCategoryRecord({
      locale: 'en',
      segments: ['developer', 'formatters'],
      categoryId: 'formatters',
    }),
    toolRecord({
      locale: 'es',
      segments: ['desarrollo', 'validador-json'],
      toolId: 'json-validator',
    }),
    toolRecord({
      locale: 'en',
      segments: ['developer', 'json-validator'],
      toolId: 'json-validator',
    }),
    articleRecord({
      locale: 'en',
      segments: ['blog', 'what-is-json'],
      articleId: 'what-is-json',
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
  return {
    area: 'tools',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'tool',
      toolId: input.toolId,
    },
    sourceId: 'fixture:resolver',
  };
}

function toolCategoryRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly categoryId: string;
}): RouteRecord {
  return {
    area: 'tools',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'tool-category',
      categoryId: input.categoryId,
    },
    sourceId: 'fixture:resolver',
  };
}

function articleRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly articleId: string;
}): RouteRecord {
  return {
    area: 'blog',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'article',
      articleId: input.articleId,
    },
    sourceId: 'fixture:resolver',
  };
}

function blogCategoryRecord(input: {
  readonly locale: RouteRecord['locale'];
  readonly segments: readonly string[];
  readonly categoryId: string;
}): RouteRecord {
  return {
    area: 'blog',
    locale: input.locale,
    segments: input.segments,
    target: {
      kind: 'blog-category',
      categoryId: input.categoryId,
    },
    sourceId: 'fixture:resolver',
  };
}

function missingTarget(): RouteTarget {
  return {
    kind: 'tool',
    toolId: 'missing-target',
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
