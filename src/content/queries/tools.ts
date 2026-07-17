import type { CollectionEntry } from 'astro:content';

import type { ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type ToolContentEntry = CollectionEntry<'tools'>;

function toolContext(toolId: ToolId, locale: Locale): ContentQueryContext {
  return {
    collection: 'tools',
    entityField: 'toolId',
    entityId: toolId,
    locale,
    status: 'published',
  };
}

export async function getPublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.tools.find({ toolId, locale });
}

export async function requirePublishedToolContent(
  toolId: ToolId,
  locale: Locale,
): Promise<ToolContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.tools.find({ toolId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(toolContext(toolId, locale));
  }

  return entry;
}
