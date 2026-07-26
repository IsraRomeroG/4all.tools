import { describe, expect, it } from 'vitest';

import type { RouteRecord, RouteTarget } from '@/routing/types';
import type { RouteRegistry } from '@/routing/registry/route-index';
import {
  createProductionArchitectureContext,
  validateArchitecture,
  validateRouteIntegrity,
} from '@/validation/architecture';

describe('architecture route integrity validation', () => {
  it('reports collisions from final RouteRegistry records', () => {
    const validRecord = record('tool', 'json-validator', 'json-validator');
    const issues = validateRouteIntegrity({
      routeRegistry: fakeRegistry([
        validRecord,
        { ...validRecord, sourceId: 'duplicate' },
      ]),
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'DUPLICATE_ROUTE_RECORD',
    ]);
  });

  it.each([
    ['tool', 'json-validator', 'json-validator'],
    ['tool-category', 'json', 'json'],
    ['article', 'what-is-json', 'blog/what-is-json'],
    ['blog-category', 'json-guides', 'blog/development/json-guides'],
  ] as const)('accepts the %s route-target kind', (kind, id, segment) => {
    expect(
      validateRouteIntegrity({
        routeRegistry: fakeRegistry([record(kind, id, segment)]),
      }),
    ).toEqual([]);
  });

  it('validates the production registry without route-definition coverage state', async () => {
    const context = await createProductionArchitectureContext();
    const report = await validateArchitecture({ context });

    expect(report.issues).toEqual([]);
    expect(report.inspected.routeRecords).toBeGreaterThan(0);
  });
});

function record(kind: RouteTarget['kind'], id: string, segment: string): RouteRecord {
  const target: RouteTarget = kind === 'tool'
    ? { kind, toolId: id }
    : kind === 'tool-category'
      ? { kind, categoryId: id }
      : kind === 'article'
        ? { kind, articleId: id }
        : { kind, categoryId: id };

  return {
    area: kind === 'article' || kind === 'blog-category' ? 'blog' : 'tools',
    locale: 'en',
    segments: segment.split('/'),
    target,
    sourceId: `${kind}-routes`,
  };
}

function fakeRegistry(records: readonly RouteRecord[]): RouteRegistry {
  return {
    getAll: () => records,
    findByPath: () => null,
    getCanonical: () => records[0] ?? null,
    getByTarget: () => records,
  };
}
