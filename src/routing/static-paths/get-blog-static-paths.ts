import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import type { RouteRecord } from '@/routing/types';

import {
  assertUniqueStaticPathEntries,
  freezeEntry,
  getRecordsForLocale,
  invalidProjection,
  requireRestPath,
  type BlogStaticPathEntry,
  type StaticPathFactory,
  type StaticPathFactoryInput,
} from './shared';

const BLOG_PROJECTION = 'blog';
const BLOG_ROOT_SEGMENT = 'blog';

export function createBlogStaticPaths(
  input: StaticPathFactoryInput,
): StaticPathFactory {
  return (async () => [
    ...getBlogStaticPathEntries(
      await input.getRegistry(),
      input.locale,
    ),
  ]) satisfies StaticPathFactory;
}

export function getBlogStaticPathEntries(
  registry: RouteRegistry,
  locale: Locale,
): readonly BlogStaticPathEntry[] {
  const entries = getRecordsForLocale(registry, locale)
    .filter(isBlogCatchAllTarget)
    .map(projectBlogRecord);

  assertUniqueStaticPathEntries(
    entries,
    (entry) => `path=${entry.params.path}`,
    BLOG_PROJECTION,
  );

  return Object.freeze(entries);
}

function isBlogCatchAllTarget(record: RouteRecord): boolean {
  return (
    record.area === 'blog' &&
    (record.target.kind === 'article' || record.target.kind === 'blog-category') &&
    record.segments.length >= 2
  );
}

function projectBlogRecord(record: RouteRecord): BlogStaticPathEntry {
  if (record.segments[0] !== BLOG_ROOT_SEGMENT) {
    throw invalidProjection(
      record,
      BLOG_PROJECTION,
      `Blog route ${record.segments.join('/')} cannot be projected because it does not start with "${BLOG_ROOT_SEGMENT}".`,
    );
  }

  return freezeEntry({
    params: Object.freeze({
      path: requireRestPath(record, 1, BLOG_PROJECTION),
    }),
    props: Object.freeze({
      routeTarget: record.target,
    }),
  });
}
