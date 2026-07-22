import type { CollectionEntry } from 'astro:content';

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
