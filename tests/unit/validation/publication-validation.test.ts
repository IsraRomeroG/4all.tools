import { describe, expect, it } from 'vitest';

import type { RouteDefinition } from '@/routing/definitions';
import { createRouteRegistryFromRecords } from '@/routing/registry/route-index';
import type { RouteRecord, RouteTarget } from '@/routing/types';
import {
  createProductionArchitectureContext,
  validateArchitecture,
  validateRouteIntegrity,
} from '@/validation/architecture';

describe('architecture route integrity validation', () => {
  it('reports route collisions and published definitions without public variants', () => {
    const validRecord = record('tool', 'json-validator', 'json-validator');
    const issues = validateRouteIntegrity({
      routeDefinitions: [
        toolDefinition('json-validator', 'published'),
        toolDefinition('missing-tool', 'published'),
      ],
      routeRegistry: fakeRouteRegistry([
        validRecord,
        { ...validRecord, sourceId: 'duplicate' },
      ]),
    });

    expect(issues.map((issue) => issue.code)).toEqual([
      'DUPLICATE_ROUTE_RECORD',
      'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT',
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
        routeDefinitions: [],
        routeRegistry: fakeRouteRegistry([record(kind, id, segment)]),
      }),
    ).toEqual([]);
  });

  it('keeps route-less content out of route integrity validation', async () => {
    const productionContext = await createProductionArchitectureContext();
    const routeDefinitions = productionContext.routeDefinitions.filter(
      (route) => route.kind !== 'article' && route.kind !== 'blog-category',
    );
    const routeRecords = productionContext.routeRegistry
      .getAll()
      .filter(
        (route) => route.target.kind !== 'article' && route.target.kind !== 'blog-category',
      );
    const routeRegistry = createRouteRegistryFromRecords(routeRecords);

    const report = await validateArchitecture({
      context: {
        ...productionContext,
        routeDefinitions,
        routeRegistry,
      },
    });

    expect(report.issues).toEqual([]);
    expect(routeRegistry.getAll()).toEqual(routeRecords);
  });
});

function record(
  kind: RouteTarget['kind'],
  id: string,
  segment: string,
): RouteRecord {
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
  } as RouteRecord;
}

function toolDefinition(id: string, status: string): RouteDefinition {
  return {
    kind: 'tool',
    definition: {
      toolId: id,
      rootCategoryId: 'developer',
      primaryCategoryId: 'json',
      strategy: 'flat',
      localized: { en: { slug: id } },
      status: status as 'published' | 'draft' | 'archived',
    },
  };
}

function fakeRouteRegistry(records: readonly RouteRecord[]) {
  return {
    getAll: () => records,
    findByPath: () => null,
    getCanonical: () => records[0] ?? null,
    getByTarget: () => records,
  };
}
