import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  assertUniqueStaticPathEntries,
  freezeEntry,
  getRecordsForLocale,
  requireSegment,
  type RootCategoryStaticPathEntry,
  type RootStaticPathEntry,
  type StaticPathFactory,
  type StaticPathFactoryInput,
} from './shared';

const ROOT_PROJECTION = 'root';

export function createRootCategoryStaticPaths(
  input: StaticPathFactoryInput,
): StaticPathFactory {
  return (async () => [
    ...getRootCategoryStaticPathEntries(
      await input.getRegistry(),
      input.locale,
    ),
  ]) satisfies StaticPathFactory;
}

export function getRootCategoryStaticPathEntries(
  registry: RouteRegistry,
  locale: Locale,
): readonly RootStaticPathEntry[] {
  const entries = getRecordsForLocale(registry, locale)
    .filter(isRootRecord)
    .map(projectRootRecord);

  assertUniqueStaticPathEntries(
    entries,
    (entry) => `category=${entry.params.category}`,
    ROOT_PROJECTION,
  );

  return Object.freeze(entries);
}

function isRootRecord(record: RouteRecord): boolean {
  return (
    ((record.area === 'tools' && record.target.kind === 'tool-category') ||
      (record.area === 'static' && record.target.kind === 'static-page')) &&
    record.segments.length === 1
  );
}

function projectRootRecord(record: RouteRecord): RootCategoryStaticPathEntry {
  return freezeEntry({
    params: Object.freeze({
      category: requireSegment(record, 0, ROOT_PROJECTION),
    }),
    props: Object.freeze({
      routeTarget: record.target,
    }),
  });
}
