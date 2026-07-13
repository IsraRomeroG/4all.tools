import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  assertUniqueStaticPathEntries,
  freezeEntry,
  getRecordsForLocale,
  requireRestPath,
  requireSegment,
  type StaticPathFactory,
  type StaticPathFactoryInput,
  type ToolAreaStaticPathEntry,
} from './shared';

const TOOL_AREA_PROJECTION = 'tool-area';

export function createToolAreaStaticPaths(
  input: StaticPathFactoryInput,
): StaticPathFactory {
  return (async () => [
    ...getToolAreaStaticPathEntries(
      await input.getRegistry(),
      input.locale,
    ),
  ]) satisfies StaticPathFactory;
}

export function getToolAreaStaticPathEntries(
  registry: RouteRegistry,
  locale: Locale,
): readonly ToolAreaStaticPathEntry[] {
  const entries = getRecordsForLocale(registry, locale)
    .filter(isToolAreaCatchAllRecord)
    .map(projectToolAreaRecord);

  assertUniqueStaticPathEntries(
    entries,
    (entry) => `category=${entry.params.category}|path=${entry.params.path}`,
    TOOL_AREA_PROJECTION,
  );

  return Object.freeze(entries);
}

function isToolAreaCatchAllRecord(record: RouteRecord): boolean {
  return (
    record.area === 'tools' &&
    (record.target.kind === 'tool' || record.target.kind === 'tool-category') &&
    record.segments.length >= 2
  );
}

function projectToolAreaRecord(record: RouteRecord): ToolAreaStaticPathEntry {
  return freezeEntry({
    params: Object.freeze({
      category: requireSegment(record, 0, TOOL_AREA_PROJECTION),
      path: requireRestPath(record, 1, TOOL_AREA_PROJECTION),
    }),
    props: Object.freeze({
      routeTarget: record.target,
    }),
  });
}
