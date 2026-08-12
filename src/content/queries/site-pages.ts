import type { CollectionEntry } from 'astro:content';

import type { SitePageId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type SitePageContentEntry = CollectionEntry<'sitePages'>;

function sitePageContext(
  pageId: SitePageId,
  locale: Locale,
): ContentQueryContext {
  return {
    collection: 'sitePages',
    entityField: 'pageId',
    entityId: pageId,
    locale,
    status: 'published',
  };
}

export async function getPublishedSitePageContent(
  pageId: SitePageId,
  locale: Locale,
): Promise<SitePageContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.sitePages.find({ pageId, locale });
}

export async function requirePublishedSitePageContent(
  pageId: SitePageId,
  locale: Locale,
): Promise<SitePageContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.sitePages.find({ pageId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(sitePageContext(pageId, locale));
  }

  return entry;
}

export async function listPublishedSitePageContent(
  locale: Locale,
): Promise<readonly SitePageContentEntry[]> {
  const indexes = await getPublishedContentIndexes();

  return indexes.sitePages.list(locale);
}
