import type { GetStaticPaths } from 'astro';

import type { Locale } from '@/i18n/types';
import type { MaybePromise } from '@/routing/definitions';
import { RoutingInvariantError } from '@/routing/errors';
import type { RouteRegistry } from '@/routing/registry';
import { getRouteTargetKey, type RouteRecord, type RouteTarget } from '@/routing/types';

export interface StaticPathFactoryInput {
  readonly locale: Locale;
  readonly getRegistry: () => MaybePromise<RouteRegistry>;
}

export interface StaticPathProps extends Record<string, unknown> {
  readonly routeTarget: RouteTarget;
}

export interface RootCategoryStaticPathEntry {
  readonly params: {
    readonly category: string;
  };
  readonly props: StaticPathProps;
}

export interface ToolAreaStaticPathEntry {
  readonly params: {
    readonly category: string;
    readonly path: string;
  };
  readonly props: StaticPathProps;
}

export interface BlogStaticPathEntry {
  readonly params: {
    readonly path: string;
  };
  readonly props: StaticPathProps;
}

export type StaticPathFactory = GetStaticPaths;

export function getRecordsForLocale(
  registry: RouteRegistry,
  locale: Locale,
): readonly RouteRecord[] {
  return registry.getAll().filter((record) => record.locale === locale);
}

export function requireSegment(
  record: RouteRecord,
  index: number,
  projection: string,
): string {
  const segment = record.segments[index];

  if (segment !== undefined && segment.length > 0) {
    return segment;
  }

  throw invalidProjection(
    record,
    projection,
    `Route ${getRouteTargetKey(record.target)} cannot be projected because segment ${index} is missing.`,
  );
}

export function requireRestPath(
  record: RouteRecord,
  startIndex: number,
  projection: string,
): string {
  const segments = record.segments.slice(startIndex);

  if (segments.length > 0 && segments.every((segment) => segment.length > 0)) {
    return segments.join('/');
  }

  throw invalidProjection(
    record,
    projection,
    `Route ${getRouteTargetKey(record.target)} cannot be projected because rest path is empty.`,
  );
}

export function assertUniqueStaticPathEntries<TEntry>(
  entries: readonly TEntry[],
  getKey: (entry: TEntry) => string,
  projection: string,
): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    const key = getKey(entry);

    if (seen.has(key)) {
      throw new RoutingInvariantError(
        'INVALID_STATIC_PATH_PROJECTION',
        `Duplicate ${projection} static path params ${key}.`,
        {
          projection,
          key,
        },
      );
    }

    seen.add(key);
  }
}

export function invalidProjection(
  record: RouteRecord,
  projection: string,
  message: string,
): RoutingInvariantError {
  return new RoutingInvariantError('INVALID_STATIC_PATH_PROJECTION', message, {
    projection,
    locale: record.locale,
    area: record.area,
    segments: record.segments,
    targetKey: getRouteTargetKey(record.target),
    sourceId: record.sourceId,
  });
}

export function freezeEntry<TEntry extends object>(entry: TEntry): TEntry {
  return Object.freeze(entry);
}
