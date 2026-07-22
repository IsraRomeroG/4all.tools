import type { ArticleId, BlogCategoryId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import {
  ContentNotFoundError,
  type ContentQueryContext,
} from './errors';
import type { ArticleContentEntry } from './blog';
import type { BlogCategoryContentEntry } from './blog-categories';
import type { PublishedContentIndexes } from './indexed-content-source';

export interface BlogContentQueryDependencies {
  readonly getPublishedContentIndexes: () => Promise<PublishedContentIndexes>;
}

export interface BlogContentQueries {
  getPublishedArticleContent(
    articleId: ArticleId,
    locale: Locale,
  ): Promise<ArticleContentEntry | null>;
  requirePublishedArticleContent(
    articleId: ArticleId,
    locale: Locale,
  ): Promise<ArticleContentEntry>;
  listPublishedArticleContent(
    locale: Locale,
  ): Promise<readonly ArticleContentEntry[]>;
  getPublishedBlogCategoryContent(
    categoryId: BlogCategoryId,
    locale: Locale,
  ): Promise<BlogCategoryContentEntry | null>;
  requirePublishedBlogCategoryContent(
    categoryId: BlogCategoryId,
    locale: Locale,
  ): Promise<BlogCategoryContentEntry>;
}

export function createBlogContentQueries(
  dependencies: BlogContentQueryDependencies,
): BlogContentQueries {
  return Object.freeze({
    getPublishedArticleContent: async (articleId: ArticleId, locale: Locale) => {
      const indexes = await dependencies.getPublishedContentIndexes();

      return indexes.blog.find({ articleId, locale });
    },
    requirePublishedArticleContent: async (
      articleId: ArticleId,
      locale: Locale,
    ) => {
      const indexes = await dependencies.getPublishedContentIndexes();
      const entry = indexes.blog.find({ articleId, locale });

      if (entry === null) {
        throw new ContentNotFoundError(articleContext(articleId, locale));
      }

      return entry;
    },
    listPublishedArticleContent: async (locale: Locale) => {
      const indexes = await dependencies.getPublishedContentIndexes();

      return indexes.blog.list(locale);
    },
    getPublishedBlogCategoryContent: async (
      categoryId: BlogCategoryId,
      locale: Locale,
    ) => {
      const indexes = await dependencies.getPublishedContentIndexes();

      return indexes.blogCategories.find({ categoryId, locale });
    },
    requirePublishedBlogCategoryContent: async (
      categoryId: BlogCategoryId,
      locale: Locale,
    ) => {
      const indexes = await dependencies.getPublishedContentIndexes();
      const entry = indexes.blogCategories.find({ categoryId, locale });

      if (entry === null) {
        throw new ContentNotFoundError(
          blogCategoryContext(categoryId, locale),
        );
      }

      return entry;
    },
  });
}

function articleContext(
  articleId: ArticleId,
  locale: Locale,
): ContentQueryContext {
  return {
    collection: 'blog',
    entityField: 'articleId',
    entityId: articleId,
    locale,
    status: 'published',
  };
}

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
