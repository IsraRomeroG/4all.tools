import type { CollectionEntry } from 'astro:content';

import type { StaticPageId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type StaticPageContentEntry = CollectionEntry<'staticPages'>;

function staticPageContext(
  pageId: StaticPageId,
  locale: Locale,
): ContentQueryContext {
  return {
    collection: 'staticPages',
    entityField: 'pageId',
    entityId: pageId,
    locale,
    status: 'published',
  };
}

export async function getPublishedStaticPageContent(
  pageId: StaticPageId,
  locale: Locale,
): Promise<StaticPageContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.staticPages.find({ pageId, locale });
}

export async function requirePublishedStaticPageContent(
  pageId: StaticPageId,
  locale: Locale,
): Promise<StaticPageContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.staticPages.find({ pageId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(staticPageContext(pageId, locale));
  }

  return entry;
}

export async function listPublishedStaticPageContent(
  locale: Locale,
): Promise<readonly StaticPageContentEntry[]> {
  const indexes = await getPublishedContentIndexes();

  return indexes.staticPages.list(locale);
}
