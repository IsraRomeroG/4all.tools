import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  assertUniqueStaticPathEntries,
  freezeEntry,
  getRecordsForLocale,
  requireSegment,
  type RootStaticPathEntry,
  type StaticPathFactory,
  type StaticPathFactoryInput,
} from './shared';

const ROOT_PROJECTION = 'root';

export function createRootStaticPaths(
  input: StaticPathFactoryInput,
): StaticPathFactory {
  return (async () => [
    ...getRootStaticPathEntries(
      await input.getRegistry(),
      input.locale,
    ),
  ]) satisfies StaticPathFactory;
}

export function getRootStaticPathEntries(
  registry: RouteRegistry,
  locale: Locale,
): readonly RootStaticPathEntry[] {
  const entries = getRecordsForLocale(registry, locale)
    .filter(isRootRecord)
    .map(projectRootRecord);

  assertUniqueStaticPathEntries(
    entries,
    (entry) => `root=${entry.params.root}`,
    ROOT_PROJECTION,
  );

  return Object.freeze(entries);
}

function isRootRecord(record: RouteRecord): boolean {
  return (
    ((record.area === 'tools' && record.target.kind === 'tool-category') ||
      (record.area === 'site' && record.target.kind === 'site-page')) &&
    record.segments.length === 1
  );
}

function projectRootRecord(record: RouteRecord): RootStaticPathEntry {
  return freezeEntry({
    params: Object.freeze({
      root: requireSegment(record, 0, ROOT_PROJECTION),
    }),
    props: Object.freeze({
      routeTarget: record.target,
    }),
  });
}
