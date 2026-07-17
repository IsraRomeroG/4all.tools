import type { CollectionEntry } from 'astro:content';

import type { ToolCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type ToolCategoryContentEntry = CollectionEntry<'toolCategories'>;

function toolCategoryContext(
  categoryId: ToolCategoryId,
  locale: Locale,
): ContentQueryContext {
  return {
    collection: 'toolCategories',
    entityField: 'categoryId',
    entityId: categoryId,
    locale,
    status: 'published',
  };
}

export async function getPublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<ToolCategoryContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.toolCategories.find({ categoryId, locale });
}

export async function requirePublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<ToolCategoryContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.toolCategories.find({ categoryId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(toolCategoryContext(categoryId, locale));
  }

  return entry;
}
