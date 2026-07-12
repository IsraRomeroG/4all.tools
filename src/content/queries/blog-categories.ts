import type { CollectionEntry } from 'astro:content';

import type { BlogCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { getCollection } from './astro-content';
import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { resolveExactMatch } from './shared';

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
  const matches = await getCollection(
    'blogCategories',
    ({ data }) =>
      data.categoryId === categoryId &&
      data.locale === locale &&
      data.status === 'published',
  );

  return resolveExactMatch(matches, blogCategoryContext(categoryId, locale));
}

export async function requirePublishedBlogCategoryContent(
  categoryId: BlogCategoryId,
  locale: Locale,
): Promise<BlogCategoryContentEntry> {
  const entry = await getPublishedBlogCategoryContent(categoryId, locale);

  if (entry === null) {
    throw new ContentNotFoundError(blogCategoryContext(categoryId, locale));
  }

  return entry;
}
