import {
  getLocalizedTargetKey,
  getRouteTargetKey,
  type LocalizedPathKey,
  type LocalizedTargetKey,
  type RouteRecord,
  type RouteTargetKey,
} from '@/routing/types';

import {
  createRouteValidationIssue,
  type RouteValidationIssue,
} from './types';

interface RouteCollisionCandidate {
  readonly record: RouteRecord;
  readonly path: string;
  readonly normalizedPath: string;
  readonly pathKey: LocalizedPathKey;
  readonly targetKey: RouteTargetKey;
  readonly localizedTargetKey: LocalizedTargetKey;
}

interface CollisionOwner {
  readonly path: string;
  readonly targetKey: RouteTargetKey;
  readonly sourceId: string;
}

export function inspectRouteCollisions(
  records: readonly RouteRecord[],
): readonly RouteValidationIssue[] {
  const candidates = records.map(createCollisionCandidate);

  return Object.freeze([
    ...inspectPublicPathCollisions(candidates),
    ...inspectCanonicalTargetCollisions(candidates),
  ]);
}

function inspectPublicPathCollisions(
  candidates: readonly RouteCollisionCandidate[],
): readonly RouteValidationIssue[] {
  const issues: RouteValidationIssue[] = [];
  const byPath = groupBy(candidates, (candidate) => candidate.pathKey);

  for (const group of sortedGroups(byPath)) {
    const byTarget = groupBy(group.items, (candidate) => candidate.targetKey);

    for (const targetGroup of sortedGroups(byTarget)) {
      if (targetGroup.items.length <= 1) {
        continue;
      }

      const sample = targetGroup.items[0]!;

      issues.push(
        createRouteValidationIssue({
          code: 'DUPLICATE_ROUTE_RECORD',
          locale: sample.record.locale,
          path: sample.normalizedPath,
          targetKey: sample.targetKey,
          sourceIds: getSourceIds(targetGroup.items),
          message: `Duplicate route record ${sample.record.locale}:${sample.normalizedPath} for ${sample.targetKey}.`,
          context: {
            owners: getOwners(targetGroup.items),
            pathKey: sample.pathKey,
            targetKey: sample.targetKey,
          },
        }),
      );
    }

    if (byTarget.size <= 1) {
      continue;
    }

    const sample = group.items[0]!;

    issues.push(
      createRouteValidationIssue({
        code: 'DUPLICATE_PUBLIC_PATH',
        locale: sample.record.locale,
        path: sample.normalizedPath,
        sourceIds: getSourceIds(group.items),
        message: `Duplicate public path ${sample.record.locale}:${sample.normalizedPath} claimed by ${getTargetKeys(group.items).join(', ')}.`,
        context: {
          owners: getOwners(group.items),
          pathKey: sample.pathKey,
          targetKeys: getTargetKeys(group.items),
        },
      }),
    );
  }

  return issues;
}

function inspectCanonicalTargetCollisions(
  candidates: readonly RouteCollisionCandidate[],
): readonly RouteValidationIssue[] {
  const issues: RouteValidationIssue[] = [];
  const byTarget = groupBy(
    candidates,
    (candidate) => candidate.localizedTargetKey,
  );

  for (const group of sortedGroups(byTarget)) {
    const pathKeys = new Set(group.items.map((candidate) => candidate.pathKey));

    if (pathKeys.size <= 1) {
      continue;
    }

    const sample = group.items[0]!;

    issues.push(
      createRouteValidationIssue({
        code: 'DUPLICATE_CANONICAL_TARGET',
        locale: sample.record.locale,
        targetKey: sample.targetKey,
        sourceIds: getSourceIds(group.items),
        message: `Duplicate canonical target ${sample.localizedTargetKey} claimed by ${getPaths(group.items).join(', ')}.`,
        context: {
          owners: getOwners(group.items),
          localizedTargetKey: sample.localizedTargetKey,
          paths: getPaths(group.items),
        },
      }),
    );
  }

  return issues;
}

function createCollisionCandidate(
  record: RouteRecord,
): RouteCollisionCandidate {
  const normalizedSegments = record.segments.map((segment) =>
    segment.toLowerCase(),
  );
  const normalizedPath = normalizedSegments.join('/');
  const targetKey = getRouteTargetKey(record.target);

  return {
    record,
    path: record.segments.join('/'),
    normalizedPath,
    pathKey: `${record.locale}:${normalizedPath}`,
    targetKey,
    localizedTargetKey: getLocalizedTargetKey(record.locale, record.target),
  };
}

function getOwners(
  candidates: readonly RouteCollisionCandidate[],
): readonly CollisionOwner[] {
  return Object.freeze(
    candidates
      .map((candidate) =>
        Object.freeze({
          path: candidate.path,
          targetKey: candidate.targetKey,
          sourceId: candidate.record.sourceId,
        }),
      )
      .sort(compareCollisionOwners),
  );
}

function getSourceIds(
  candidates: readonly RouteCollisionCandidate[],
): readonly string[] {
  return Object.freeze(
    [...new Set(candidates.map((candidate) => candidate.record.sourceId))].sort(
      compareText,
    ),
  );
}

function getTargetKeys(
  candidates: readonly RouteCollisionCandidate[],
): readonly RouteTargetKey[] {
  return Object.freeze(
    [...new Set(candidates.map((candidate) => candidate.targetKey))].sort(
      compareText,
    ),
  );
}

function getPaths(
  candidates: readonly RouteCollisionCandidate[],
): readonly string[] {
  return Object.freeze(
    [...new Set(candidates.map((candidate) => candidate.path))].sort(
      compareText,
    ),
  );
}

function groupBy<TKey extends string, TValue>(
  values: readonly TValue[],
  getKey: (value: TValue) => TKey,
): ReadonlyMap<TKey, readonly TValue[]> {
  const groups = new Map<TKey, TValue[]>();

  for (const value of values) {
    const key = getKey(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }

  return groups;
}

function sortedGroups<TKey extends string, TValue>(
  groups: ReadonlyMap<TKey, readonly TValue[]>,
): readonly { readonly key: TKey; readonly items: readonly TValue[] }[] {
  return Object.freeze(
    [...groups]
      .map(([key, items]) => ({
        key,
        items: Object.freeze([...items]),
      }))
      .sort((first, second) => compareText(first.key, second.key)),
  );
}

function compareCollisionOwners(
  first: CollisionOwner,
  second: CollisionOwner,
): number {
  return (
    compareText(first.path, second.path) ||
    compareText(first.targetKey, second.targetKey) ||
    compareText(first.sourceId, second.sourceId)
  );
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
