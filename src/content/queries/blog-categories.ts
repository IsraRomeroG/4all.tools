import type { CollectionEntry } from 'astro:content';
import type { Locale } from '@/i18n/types';

import { createBlogContentQueries } from './blog-content-queries';
import { getPublishedContentIndexes } from './indexed-content-source';

export type BlogCategoryContentEntry = CollectionEntry<'blogCategories'>;

const productionBlogContentQueries = createBlogContentQueries({
  getPublishedContentIndexes,
});

export const getPublishedBlogCategoryContent =
  productionBlogContentQueries.getPublishedBlogCategoryContent;

export const requirePublishedBlogCategoryContent =
  productionBlogContentQueries.requirePublishedBlogCategoryContent;

export async function listPublishedBlogCategoryContent(
  locale: Locale,
): Promise<readonly BlogCategoryContentEntry[]> {
  const indexes = await getPublishedContentIndexes();

  return indexes.blogCategories.list(locale);
}
