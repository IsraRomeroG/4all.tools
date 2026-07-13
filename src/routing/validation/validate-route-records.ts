import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { assertValidRouteSegments } from '@/routing/builders';
import { RoutingInvariantError } from '@/routing/errors';
import {
  ROUTE_AREAS,
  ROUTE_KINDS,
  getRouteTargetKey,
  type RouteArea,
  type RouteKind,
  type RouteRecord,
  type RouteTarget,
} from '@/routing/types';

import { inspectRouteCollisions } from './validate-route-collisions';
import {
  formatReservedNamespaceConflict,
  getReservedNamespaceConflict,
} from './validate-reserved-paths';
import {
  compareRouteValidationIssues,
  createRouteValidationIssue,
  type RouteValidationIssue,
} from './types';

const BLOG_ROOT_SEGMENT = 'blog';

export class RouteValidationError extends RoutingInvariantError {
  readonly issues: readonly RouteValidationIssue[];

  constructor(issues: readonly RouteValidationIssue[]) {
    const frozenIssues = Object.freeze([...issues]);
    const firstIssue = frozenIssues[0];

    super(
      firstIssue?.code ?? 'INVALID_ROUTE_RECORD',
      formatRouteValidationIssues(frozenIssues),
      {
        issueCount: frozenIssues.length,
        issues: frozenIssues,
      },
    );

    this.name = 'RouteValidationError';
    this.issues = frozenIssues;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function inspectRouteRecords(
  records: readonly RouteRecord[],
): readonly RouteValidationIssue[] {
  const issues: RouteValidationIssue[] = [];
  const collisionRecords: RouteRecord[] = [];

  records.forEach((record, index) => {
    if (!isValidRouteRecordShape(record)) {
      issues.push(createInvalidRouteRecordIssue(record, index));
      return;
    }

    collisionRecords.push(record);

    const segmentIssue = inspectSegments(record);

    if (segmentIssue) {
      issues.push(segmentIssue);
    }

    const areaIssue = inspectAreaTargetCompatibility(record);

    if (areaIssue) {
      issues.push(areaIssue);
    }

    const blogNamespaceIssue = inspectBlogNamespace(record);

    if (blogNamespaceIssue) {
      issues.push(blogNamespaceIssue);
    }

    const reservedIssue = inspectReservedNamespace(record);

    if (reservedIssue) {
      issues.push(reservedIssue);
    }
  });

  issues.push(...inspectRouteCollisions(collisionRecords));

  return Object.freeze([...issues].sort(compareRouteValidationIssues));
}

export function assertValidRouteRecords(
  records: readonly RouteRecord[],
): readonly RouteRecord[] {
  const issues = inspectRouteRecords(records);

  if (issues.length > 0) {
    throw new RouteValidationError(issues);
  }

  return records;
}

export function formatRouteValidationIssues(
  issues: readonly RouteValidationIssue[],
): string {
  if (issues.length === 0) {
    return 'Route validation failed with no diagnostic issues.';
  }

  const issueLabel = issues.length === 1 ? 'issue' : 'issues';

  return [
    `Route validation failed with ${issues.length} ${issueLabel}:`,
    ...issues.map((issue) => `- ${issue.code}: ${issue.message}`),
  ].join('\n');
}

function inspectSegments(record: RouteRecord): RouteValidationIssue | null {
  try {
    assertValidRouteSegments(record.segments, {
      locale: record.locale,
      path: getPath(record),
      targetKey: getRouteTargetKey(record.target),
      sourceId: record.sourceId,
    });

    return null;
  } catch (error) {
    if (!(error instanceof RoutingInvariantError)) {
      throw error;
    }

    if (error.code !== 'INVALID_SEGMENT' && error.code !== 'EMPTY_SEGMENTS') {
      throw error;
    }

    return createRouteValidationIssue({
      code: error.code,
      locale: record.locale,
      path: getPath(record),
      targetKey: getRouteTargetKey(record.target),
      sourceIds: [record.sourceId],
      message: error.message,
      context: {
        ...error.context,
        area: record.area,
      },
    });
  }
}

function inspectAreaTargetCompatibility(
  record: RouteRecord,
): RouteValidationIssue | null {
  if (isAreaTargetCompatible(record.area, record.target)) {
    return null;
  }

  const targetKey = getRouteTargetKey(record.target);

  return createRouteValidationIssue({
    code: 'INVALID_AREA_TARGET',
    locale: record.locale,
    path: getPath(record),
    targetKey,
    sourceIds: [record.sourceId],
    message: `Route target ${targetKey} is not valid in route area "${record.area}".`,
    context: {
      area: record.area,
      targetKind: record.target.kind,
    },
  });
}

function inspectBlogNamespace(record: RouteRecord): RouteValidationIssue | null {
  if (record.area !== 'blog' || record.segments[0] === BLOG_ROOT_SEGMENT) {
    return null;
  }

  const targetKey = getRouteTargetKey(record.target);

  return createRouteValidationIssue({
    code: 'INVALID_BLOG_NAMESPACE',
    locale: record.locale,
    path: getPath(record),
    targetKey,
    sourceIds: [record.sourceId],
    message: `Blog route ${targetKey} must start with "${BLOG_ROOT_SEGMENT}".`,
    context: {
      area: record.area,
      expectedRootSegment: BLOG_ROOT_SEGMENT,
      segments: record.segments,
    },
  });
}

function inspectReservedNamespace(
  record: RouteRecord,
): RouteValidationIssue | null {
  const conflict = getReservedNamespaceConflict({
    locale: record.locale,
    area: record.area,
    segments: record.segments,
    target: record.target,
    sourceId: record.sourceId,
  });

  if (!conflict) {
    return null;
  }

  return createRouteValidationIssue({
    code: conflict.code,
    locale: conflict.locale,
    path: getPath(record),
    targetKey: getRouteTargetKey(conflict.target),
    sourceIds: conflict.sourceId !== undefined ? [conflict.sourceId] : [],
    message: formatReservedNamespaceConflict(conflict),
    context: {
      segment: conflict.segment,
      scope: conflict.scope,
      reservedOwner: conflict.reservedOwner,
      routeArea: conflict.routeArea,
      reason: conflict.reason,
    },
  });
}

function createInvalidRouteRecordIssue(
  record: unknown,
  index: number,
): RouteValidationIssue {
  const locale = getMaybeLocale(record);
  const path = getMaybePath(record);
  const targetKey = getMaybeTargetKey(record);

  return createRouteValidationIssue({
    code: 'INVALID_ROUTE_RECORD',
    sourceIds: getMaybeSourceId(record),
    message: `Route record at index ${index} is structurally invalid.`,
    context: {
      index,
      record,
    },
    ...(locale !== undefined ? { locale } : {}),
    ...(path !== undefined ? { path } : {}),
    ...(targetKey !== undefined ? { targetKey } : {}),
  });
}

function isValidRouteRecordShape(record: unknown): record is RouteRecord {
  if (!isObject(record)) {
    return false;
  }

  return (
    isRouteArea(record.area) &&
    isLocale(record.locale) &&
    Array.isArray(record.segments) &&
    record.segments.every((segment) => typeof segment === 'string') &&
    isRouteTarget(record.target) &&
    typeof record.sourceId === 'string' &&
    record.sourceId.length > 0
  );
}

function isAreaTargetCompatible(
  area: RouteArea,
  target: RouteTarget,
): boolean {
  switch (area) {
    case 'tools':
      return target.kind === 'tool' || target.kind === 'tool-category';

    case 'blog':
      return target.kind === 'article' || target.kind === 'blog-category';

    case 'home':
    case 'static':
      return false;

    default:
      return false;
  }
}

function isRouteTarget(target: unknown): target is RouteTarget {
  if (!isObject(target) || !isRouteKind(target.kind)) {
    return false;
  }

  switch (target.kind) {
    case 'tool':
      return isNonEmptyString(target.toolId);

    case 'tool-category':
    case 'blog-category':
      return isNonEmptyString(target.categoryId);

    case 'article':
      return isNonEmptyString(target.articleId);

    default:
      return false;
  }
}

function getMaybeLocale(record: unknown): Locale | undefined {
  if (isObject(record) && isLocale(record.locale)) {
    return record.locale;
  }

  return undefined;
}

function getMaybePath(record: unknown): string | undefined {
  if (
    isObject(record) &&
    Array.isArray(record.segments) &&
    record.segments.every((segment) => typeof segment === 'string')
  ) {
    return record.segments.join('/');
  }

  return undefined;
}

function getMaybeTargetKey(record: unknown): string | undefined {
  if (isObject(record) && isRouteTarget(record.target)) {
    return getRouteTargetKey(record.target);
  }

  return undefined;
}

function getMaybeSourceId(record: unknown): readonly string[] {
  if (isObject(record) && typeof record.sourceId === 'string') {
    return [record.sourceId];
  }

  return [];
}

function getPath(record: RouteRecord): string {
  return record.segments.join('/');
}

function isRouteArea(value: unknown): value is RouteArea {
  return (
    typeof value === 'string' && ROUTE_AREAS.includes(value as RouteArea)
  );
}

function isRouteKind(value: unknown): value is RouteKind {
  return (
    typeof value === 'string' && ROUTE_KINDS.includes(value as RouteKind)
  );
}

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
