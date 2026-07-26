import { getRouteTargetKey, type RouteRecord, type RouteTarget } from '@/routing/types';
import { inspectRouteRecords, type RouteValidationIssue } from '@/routing/validation';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type { ArchitectureValidationContext } from '../context';
import type { ArchitectureValidationIssue } from '../types';

export function validateRouteIntegrity(
  context: Pick<ArchitectureValidationContext, 'routeDefinitions' | 'routeRegistry'>,
): readonly ArchitectureValidationIssue[] {
  const records = context.routeRegistry.getAll();
  const issues = [
    ...inspectRouteRecords(records).map(adaptRouteIssue),
    ...validatePublishedDefinitionCoverage(context.routeDefinitions, records),
  ];

  return Object.freeze([...issues].sort(compareArchitectureValidationIssues));
}

function validatePublishedDefinitionCoverage(
  definitions: ArchitectureValidationContext['routeDefinitions'],
  records: readonly RouteRecord[],
): readonly ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];

  for (const route of definitions) {
    if (route.definition.status !== 'published') {
      continue;
    }

    const target = routeTarget(route);
    const targetKey = getRouteTargetKey(target);

    if (records.some((record) => getRouteTargetKey(record.target) === targetKey)) {
      continue;
    }

    issues.push(
      createArchitectureValidationIssue({
        code: 'PUBLISHED_ROUTE_DEFINITION_WITHOUT_PUBLIC_VARIANT',
        scope: 'routing',
        message: `Published route definition ${targetKey} produces no public route variant.`,
        entityKey: targetKey,
        details: { target },
      }),
    );
  }

  return issues;
}

function adaptRouteIssue(issue: RouteValidationIssue): ArchitectureValidationIssue {
  return createArchitectureValidationIssue({
    code: issue.code,
    scope: 'routing',
    message: issue.message,
    ...(issue.locale === undefined ? {} : { locale: issue.locale }),
    ...(issue.targetKey === undefined ? {} : { entityKey: issue.targetKey }),
    ...(issue.sourceIds?.[0] === undefined ? {} : { sourceId: issue.sourceIds[0] }),
    details: {
      causeCode: issue.code,
      path: issue.path ?? null,
      sourceIds: issue.sourceIds ?? [],
      context: issue.context,
    },
  });
}

function routeTarget(route: ArchitectureValidationContext['routeDefinitions'][number]): RouteTarget {
  switch (route.kind) {
    case 'tool':
      return { kind: 'tool', toolId: route.definition.toolId };
    case 'tool-category':
      return { kind: 'tool-category', categoryId: route.definition.categoryId };
    case 'article':
      return { kind: 'article', articleId: route.definition.articleId };
    case 'blog-category':
      return { kind: 'blog-category', categoryId: route.definition.categoryId };
  }
}
