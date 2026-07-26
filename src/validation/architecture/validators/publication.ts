import { inspectRouteRecords, type RouteValidationIssue } from '@/routing/validation';

import {
  compareArchitectureValidationIssues,
  createArchitectureValidationIssue,
} from '../report';
import type { ArchitectureValidationContext } from '../context';
import type { ArchitectureValidationIssue } from '../types';

export function validateRouteIntegrity(
  context: Pick<ArchitectureValidationContext, 'routeRegistry'>,
): readonly ArchitectureValidationIssue[] {
  return inspectRouteRecords(context.routeRegistry.getAll())
    .map(adaptRouteIssue)
    .sort(compareArchitectureValidationIssues);
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
