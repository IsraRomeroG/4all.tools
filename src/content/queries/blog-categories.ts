import type { CollectionEntry } from 'astro:content';

import type { BlogCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type BlogCategoryContentEntry = CollectionEntry<'blogCategories'>;

function blogCategoryContext(
  categoryId: BlogCategoryId,
  locale: Locale,
): ContentQueryContext {
  return {
    collection: 'blogCategories',
    entityField: 'categoryId',
    entityId: categoryId,
    locale,
    status: 'published',
  };
}

export async function getPublishedBlogCategoryContent(
  categoryId: BlogCategoryId,
  locale: Locale,
): Promise<BlogCategoryContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.blogCategories.find({ categoryId, locale });
}

export async function requirePublishedBlogCategoryContent(
  categoryId: BlogCategoryId,
  locale: Locale,
): Promise<BlogCategoryContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.blogCategories.find({ categoryId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(blogCategoryContext(categoryId, locale));
  }

  return entry;
}
