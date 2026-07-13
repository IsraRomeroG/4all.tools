import { describe, expect, it } from 'vitest';

import { RoutingInvariantError } from '@/routing';
import {
  createRouteRegistryFromRecords,
  type RouteRegistry,
} from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

describe('route registry indexes', () => {
  it('sorts records deterministically and looks up paths, canonicals, and alternates', () => {
    const registry = createRouteRegistryFromRecords([
      jsonValidatorRecord('es', ['desarrollo', 'validador-json']),
      developerCategoryRecord('en'),
      jsonValidatorRecord('en', ['developer', 'json-validator']),
    ]);

    expect(paths(registry)).toEqual([
      'en:developer',
      'en:developer/json-validator',
      'es:desarrollo/validador-json',
    ]);
    expect(
      registry.findByPath('en', ['developer', 'json-validator'])?.target,
    ).toEqual({
      kind: 'tool',
      toolId: 'json-validator',
    });
    expect(
      registry.getCanonical('es', {
        kind: 'tool',
        toolId: 'json-validator',
      })?.segments,
    ).toEqual(['desarrollo', 'validador-json']);
    expect(
      registry
        .getByTarget({
          kind: 'tool',
          toolId: 'json-validator',
        })
        .map((record) => record.locale),
    ).toEqual(['en', 'es']);
    expect(registry.findByPath('en', ['developer', 'missing'])).toBeNull();
  });

  it('returns immutable public record arrays and route records', () => {
    const registry = createRouteRegistryFromRecords([
      jsonValidatorRecord('en', ['developer', 'json-validator']),
    ]);
    const [record] = registry.getAll();

    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.getAll())).toBe(true);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record?.segments)).toBe(true);
    expect(Object.isFrozen(record?.target)).toBe(true);
  });

  it('rejects duplicate public path ownership across targets', () => {
    expectRouteError(
      () =>
        createRouteRegistryFromRecords([
          jsonValidatorRecord('en', ['developer', 'shared']),
          {
            ...jsonValidatorRecord('en', ['developer', 'shared']),
            target: {
              kind: 'tool',
              toolId: 'json-checker',
            },
            sourceId: 'fixture:other-tool',
          },
        ]),
      'DUPLICATE_PUBLIC_PATH',
    );
  });

  it('rejects duplicate identical route records', () => {
    expectRouteError(
      () =>
        createRouteRegistryFromRecords([
          jsonValidatorRecord('en', ['developer', 'json-validator']),
          jsonValidatorRecord('en', ['developer', 'json-validator']),
        ]),
      'DUPLICATE_ROUTE_RECORD',
    );
  });

  it('rejects duplicate canonical target records for one locale', () => {
    expectRouteError(
      () =>
        createRouteRegistryFromRecords([
          jsonValidatorRecord('en', ['developer', 'json-validator']),
          jsonValidatorRecord('en', ['developer', 'json-check']),
        ]),
      'DUPLICATE_CANONICAL_TARGET',
    );
  });
});

function jsonValidatorRecord(
  locale: RouteRecord['locale'],
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
    sourceId: 'fixture:route-index',
  };
}

function developerCategoryRecord(locale: RouteRecord['locale']): RouteRecord {
  return {
    area: 'tools',
    locale,
    segments: locale === 'es' ? ['desarrollo'] : ['developer'],
    target: {
      kind: 'tool-category',
      categoryId: 'developer',
    },
    sourceId: 'fixture:route-index',
  };
}

function paths(registry: RouteRegistry): string[] {
  return registry
    .getAll()
    .map((record) => `${record.locale}:${record.segments.join('/')}`);
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
