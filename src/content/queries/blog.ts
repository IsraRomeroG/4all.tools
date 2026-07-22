import type { CollectionEntry } from 'astro:content';

import { createBlogContentQueries } from './blog-content-queries';
import { getPublishedContentIndexes } from './indexed-content-source';

export type ArticleContentEntry = CollectionEntry<'blog'>;

const productionBlogContentQueries = createBlogContentQueries({
  getPublishedContentIndexes,
});

export const getPublishedArticleContent =
  productionBlogContentQueries.getPublishedArticleContent;

export const requirePublishedArticleContent =
  productionBlogContentQueries.requirePublishedArticleContent;

export const listPublishedArticleContent =
  productionBlogContentQueries.listPublishedArticleContent;
