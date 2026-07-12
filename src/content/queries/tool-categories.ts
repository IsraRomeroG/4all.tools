import type { CollectionEntry } from 'astro:content';

import type { ToolCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { getCollection } from './astro-content';
import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { resolveExactMatch } from './shared';

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
  const matches = await getCollection(
    'toolCategories',
    ({ data }) =>
      data.categoryId === categoryId &&
      data.locale === locale &&
      data.status === 'published',
  );

  return resolveExactMatch(matches, toolCategoryContext(categoryId, locale));
}

export async function requirePublishedToolCategoryContent(
  categoryId: ToolCategoryId,
  locale: Locale,
): Promise<ToolCategoryContentEntry> {
  const entry = await getPublishedToolCategoryContent(categoryId, locale);

  if (entry === null) {
    throw new ContentNotFoundError(toolCategoryContext(categoryId, locale));
  }

  return entry;
}
