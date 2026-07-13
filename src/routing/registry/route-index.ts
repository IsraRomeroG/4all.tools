import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import { RoutingInvariantError } from '@/routing/errors';
import {
  ROUTE_AREAS,
  getLocalizedPathKey,
  getLocalizedTargetKey,
  getRouteTargetKey,
  type LocalizedPathKey,
  type LocalizedTargetKey,
  type RouteRecord,
  type RouteTarget,
  type RouteTargetKey,
} from '@/routing/types';

export interface RouteRegistry {
  getAll(): readonly RouteRecord[];
  findByPath(locale: Locale, segments: readonly string[]): RouteRecord | null;
  getCanonical(locale: Locale, target: RouteTarget): RouteRecord | null;
  getByTarget(target: RouteTarget): readonly RouteRecord[];
}

export interface RouteIndex {
  readonly records: readonly RouteRecord[];
  readonly pathIndex: ReadonlyMap<LocalizedPathKey, RouteRecord>;
  readonly localizedTargetIndex: ReadonlyMap<LocalizedTargetKey, RouteRecord>;
  readonly targetIndex: ReadonlyMap<RouteTargetKey, readonly RouteRecord[]>;
}

const EMPTY_ROUTE_RECORDS: readonly RouteRecord[] = Object.freeze([]);

const LOCALE_ORDER = new Map<Locale, number>(
  SUPPORTED_LOCALES.map((locale, index) => [locale, index]),
);

const AREA_ORDER = new Map<string, number>(
  ROUTE_AREAS.map((area, index) => [area, index]),
);

export function createRouteRegistryFromRecords(
  inputRecords: readonly RouteRecord[],
): RouteRegistry {
  const index = createRouteIndex(inputRecords);

  return Object.freeze({
    getAll: () => index.records,
    findByPath: (locale: Locale, segments: readonly string[]) =>
      index.pathIndex.get(getLocalizedPathKey(locale, segments)) ?? null,
    getCanonical: (locale: Locale, target: RouteTarget) =>
      index.localizedTargetIndex.get(getLocalizedTargetKey(locale, target)) ??
      null,
    getByTarget: (target: RouteTarget) =>
      index.targetIndex.get(getRouteTargetKey(target)) ?? EMPTY_ROUTE_RECORDS,
  });
}

export function createRouteIndex(
  inputRecords: readonly RouteRecord[],
): RouteIndex {
  const records = Object.freeze(
    [...inputRecords].map(freezeRouteRecord).sort(compareRouteRecords),
  );
  const pathIndex = new Map<LocalizedPathKey, RouteRecord>();
  const localizedTargetIndex = new Map<LocalizedTargetKey, RouteRecord>();
  const mutableTargetIndex = new Map<RouteTargetKey, RouteRecord[]>();

  for (const record of records) {
    const pathKey = getLocalizedPathKey(record.locale, record.segments);
    const existingPathOwner = pathIndex.get(pathKey);

    if (existingPathOwner) {
      throw createDuplicatePathError(pathKey, existingPathOwner, record);
    }

    pathIndex.set(pathKey, record);

    const localizedTargetKey = getLocalizedTargetKey(
      record.locale,
      record.target,
    );
    const existingTargetOwner = localizedTargetIndex.get(localizedTargetKey);

    if (existingTargetOwner) {
      throw createDuplicateTargetError(
        localizedTargetKey,
        existingTargetOwner,
        record,
      );
    }

    localizedTargetIndex.set(localizedTargetKey, record);

    const targetKey = getRouteTargetKey(record.target);
    const targetRecords = mutableTargetIndex.get(targetKey) ?? [];
    targetRecords.push(record);
    mutableTargetIndex.set(targetKey, targetRecords);
  }

  const targetIndex = new Map<RouteTargetKey, readonly RouteRecord[]>();

  for (const [targetKey, targetRecords] of mutableTargetIndex) {
    targetIndex.set(
      targetKey,
      Object.freeze([...targetRecords].sort(compareRouteRecords)),
    );
  }

  return Object.freeze({
    records,
    pathIndex,
    localizedTargetIndex,
    targetIndex,
  });
}

export function compareRouteRecords(
  first: RouteRecord,
  second: RouteRecord,
): number {
  return (
    compareNumeric(
      LOCALE_ORDER.get(first.locale) ?? Number.MAX_SAFE_INTEGER,
      LOCALE_ORDER.get(second.locale) ?? Number.MAX_SAFE_INTEGER,
    ) ||
    compareNumeric(
      AREA_ORDER.get(first.area) ?? Number.MAX_SAFE_INTEGER,
      AREA_ORDER.get(second.area) ?? Number.MAX_SAFE_INTEGER,
    ) ||
    compareNumeric(first.segments.length, second.segments.length) ||
    compareText(first.segments.join('/'), second.segments.join('/')) ||
    compareText(
      getRouteTargetKey(first.target),
      getRouteTargetKey(second.target),
    )
  );
}

function freezeRouteRecord(record: RouteRecord): RouteRecord {
  return Object.freeze({
    area: record.area,
    locale: record.locale,
    segments: Object.freeze([...record.segments]),
    target: Object.freeze({ ...record.target }) as RouteRecord['target'],
    sourceId: record.sourceId,
  });
}

function createDuplicatePathError(
  pathKey: LocalizedPathKey,
  first: RouteRecord,
  second: RouteRecord,
): RoutingInvariantError {
  const firstTargetKey = getRouteTargetKey(first.target);
  const secondTargetKey = getRouteTargetKey(second.target);
  const code =
    firstTargetKey === secondTargetKey
      ? 'DUPLICATE_ROUTE_RECORD'
      : 'DUPLICATE_PUBLIC_PATH';

  return new RoutingInvariantError(
    code,
    `Duplicate route path ${pathKey} claimed by ${firstTargetKey} and ${secondTargetKey}.`,
    {
      pathKey,
      locale: first.locale,
      path: first.segments.join('/'),
      targetKeys: [firstTargetKey, secondTargetKey],
      sourceIds: [first.sourceId, second.sourceId],
    },
  );
}

function createDuplicateTargetError(
  localizedTargetKey: LocalizedTargetKey,
  first: RouteRecord,
  second: RouteRecord,
): RoutingInvariantError {
  return new RoutingInvariantError(
    'DUPLICATE_CANONICAL_TARGET',
    `Duplicate canonical target ${localizedTargetKey} claimed by ${first.segments.join('/')} and ${second.segments.join('/')}.`,
    {
      localizedTargetKey,
      locale: first.locale,
      targetKey: getRouteTargetKey(first.target),
      paths: [first.segments.join('/'), second.segments.join('/')],
      sourceIds: [first.sourceId, second.sourceId],
    },
  );
}

function compareNumeric(first: number, second: number): number {
  return first - second;
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
