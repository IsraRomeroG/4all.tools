import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  assertUniqueStaticPathEntries,
  freezeEntry,
  getRecordsForLocale,
  requireSegment,
  type RootCategoryStaticPathEntry,
  type StaticPathFactory,
  type StaticPathFactoryInput,
} from './shared';

const ROOT_CATEGORY_PROJECTION = 'root-category';

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
): readonly RootCategoryStaticPathEntry[] {
  const entries = getRecordsForLocale(registry, locale)
    .filter(isRootCategoryRecord)
    .map(projectRootCategoryRecord);

  assertUniqueStaticPathEntries(
    entries,
    (entry) => `category=${entry.params.category}`,
    ROOT_CATEGORY_PROJECTION,
  );

  return Object.freeze(entries);
}

function isRootCategoryRecord(record: RouteRecord): boolean {
  return (
    record.area === 'tools' &&
    record.target.kind === 'tool-category' &&
    record.segments.length === 1
  );
}

function projectRootCategoryRecord(
  record: RouteRecord,
): RootCategoryStaticPathEntry {
  return freezeEntry({
    params: Object.freeze({
      category: requireSegment(record, 0, ROOT_CATEGORY_PROJECTION),
    }),
    props: Object.freeze({
      routeTarget: record.target,
    }),
  });
}
