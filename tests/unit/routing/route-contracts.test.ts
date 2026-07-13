import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import {
  ROUTE_AREAS,
  ROUTE_KINDS,
  ROUTE_STRATEGIES,
  TOOL_CATEGORY_ROUTE_STRATEGIES,
  RoutingInvariantError,
  assertNever,
  getLocalizedPathKey,
  getLocalizedTargetKey,
  getRouteTargetKey,
  type RouteRecord,
  type RouteTarget,
} from '@/routing';
import type {
  RouteDefinitionProvider,
} from '@/routing/definitions/providers';

import { ROUTE_DEFINITION_FIXTURES } from '../../fixtures/routing/route-definitions';

describe('routing route contracts', () => {
  it('declares route areas, kinds, and strategies in deterministic order', () => {
    expect(ROUTE_AREAS).toEqual(['home', 'tools', 'blog', 'static']);
    expect(ROUTE_KINDS).toEqual([
      'tool',
      'tool-category',
      'article',
      'blog-category',
    ]);
    expect(ROUTE_STRATEGIES).toEqual(['flat', 'hierarchical']);
    expect(TOOL_CATEGORY_ROUTE_STRATEGIES).toEqual([
      'root',
      'hierarchical',
    ]);
  });

  it('represents route targets as explicit discriminated unions', () => {
    expectTypeOf<
      Extract<RouteTarget, { kind: 'tool' }>
    >().toEqualTypeOf<{
      readonly kind: 'tool';
      readonly toolId: ToolId;
    }>();
    expectTypeOf<
      Extract<RouteTarget, { kind: 'tool-category' }>
    >().toEqualTypeOf<{
      readonly kind: 'tool-category';
      readonly categoryId: ToolCategoryId;
    }>();
    expectTypeOf<
      Extract<RouteTarget, { kind: 'article' }>
    >().toEqualTypeOf<{
      readonly kind: 'article';
      readonly articleId: ArticleId;
    }>();
    expectTypeOf<
      Extract<RouteTarget, { kind: 'blog-category' }>
    >().toEqualTypeOf<{
      readonly kind: 'blog-category';
      readonly categoryId: BlogCategoryId;
    }>();
  });

  it('generates deterministic target keys', () => {
    expect(
      getRouteTargetKey({
        kind: 'tool',
        toolId: 'json-validator',
      }),
    ).toBe('tool:json-validator');
    expect(
      getRouteTargetKey({
        kind: 'tool-category',
        categoryId: 'developer',
      }),
    ).toBe('tool-category:developer');
    expect(
      getRouteTargetKey({
        kind: 'article',
        articleId: 'what-is-json',
      }),
    ).toBe('article:what-is-json');
    expect(
      getRouteTargetKey({
        kind: 'blog-category',
        categoryId: 'json-guides',
      }),
    ).toBe('blog-category:json-guides');
  });

  it('keeps target keys locale-independent', () => {
    const englishRecord = jsonValidatorRecord('en', [
      'developer',
      'json-validator',
    ]);
    const spanishRecord = jsonValidatorRecord('es', [
      'desarrollo',
      'validador-json',
    ]);

    expect(getRouteTargetKey(englishRecord.target)).toBe(
      getRouteTargetKey(spanishRecord.target),
    );
  });

  it('keeps different target kinds from colliding when raw IDs match', () => {
    const toolKey = getRouteTargetKey({
      kind: 'tool',
      toolId: 'json-validator',
    });
    const articleKey = getRouteTargetKey({
      kind: 'article',
      articleId: 'json-validator',
    });

    expect(toolKey).toBe('tool:json-validator');
    expect(articleKey).toBe('article:json-validator');
    expect(toolKey).not.toBe(articleKey);
  });

  it('creates localized path and localized target keys without URL data', () => {
    const target = {
      kind: 'tool',
      toolId: 'json-validator',
    } satisfies RouteTarget;

    expect(
      getLocalizedPathKey('es', ['desarrollo', 'validador-json']),
    ).toBe('es:desarrollo/validador-json');
    expect(getLocalizedTargetKey('en', target)).toBe(
      'en:tool:json-validator',
    );
    expect(getLocalizedTargetKey('es', target)).toBe(
      'es:tool:json-validator',
    );
  });

  it('documents route records as locale-relative ownership records', () => {
    const record = jsonValidatorRecord('es', [
      'desarrollo',
      'validador-json',
    ]);

    expectTypeOf<RouteRecord['locale']>().toEqualTypeOf<Locale>();
    expectTypeOf<RouteRecord['segments']>().toEqualTypeOf<
      readonly string[]
    >();
    expect(record.segments).toEqual(['desarrollo', 'validador-json']);
    expect(record.segments).not.toContain('es');
    expect(Object.keys(record)).not.toContain('params');
  });

  it('supports exhaustive target switches', () => {
    function describeTarget(target: RouteTarget): string {
      switch (target.kind) {
        case 'tool':
          return `tool ${target.toolId}`;
        case 'tool-category':
          return `tool category ${target.categoryId}`;
        case 'article':
          return `article ${target.articleId}`;
        case 'blog-category':
          return `blog category ${target.categoryId}`;
        default:
          return assertNever(target);
      }
    }

    expect(
      describeTarget({
        kind: 'tool',
        toolId: 'json-validator',
      }),
    ).toBe('tool json-validator');
  });

  it('keeps route definition fixtures explicit and test-owned', () => {
    expect(ROUTE_DEFINITION_FIXTURES.map((item) => item.kind)).toEqual([
      'tool',
      'tool-category',
      'article',
      'blog-category',
    ]);
    expect(ROUTE_DEFINITION_FIXTURES[0]?.definition.status).toBe(
      'published',
    );
  });

  it('allows route definitions to come from injected providers', async () => {
    const provider: RouteDefinitionProvider = {
      sourceId: 'fixture:routing-contracts',
      description: 'Route contract unit-test fixture provider',
      getRouteDefinitions: () => ROUTE_DEFINITION_FIXTURES,
    };

    const definitions = await provider.getRouteDefinitions();

    expect(provider.sourceId).toBe('fixture:routing-contracts');
    expect(definitions).toHaveLength(4);
  });

  it('provides typed routing invariant errors with frozen context', () => {
    const error = new RoutingInvariantError(
      'DUPLICATE_PUBLIC_PATH',
      'Duplicate public path.',
      {
        locale: 'en',
        path: 'developer/json-validator',
      },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('RoutingInvariantError');
    expect(error.code).toBe('DUPLICATE_PUBLIC_PATH');
    expect(error.context).toEqual({
      locale: 'en',
      path: 'developer/json-validator',
    });
    expect(Object.isFrozen(error.context)).toBe(true);
  });
});

function jsonValidatorRecord(
  locale: Locale,
  segments: readonly string[],
): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments,
    target: {
      kind: 'tool',
      toolId: 'json-validator',
    },
    sourceId: 'fixture:routing-contracts',
  };
}
