import type { CollectionEntry } from 'astro:content';

import type { ArticleId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { getPublishedContentIndexes } from './indexed-content-source';

export type ArticleContentEntry = CollectionEntry<'blog'>;

function articleContext(articleId: ArticleId, locale: Locale): ContentQueryContext {
  return {
    collection: 'blog',
    entityField: 'articleId',
    entityId: articleId,
    locale,
    status: 'published',
  };
}

export async function getPublishedArticleContent(
  articleId: ArticleId,
  locale: Locale,
): Promise<ArticleContentEntry | null> {
  const indexes = await getPublishedContentIndexes();

  return indexes.blog.find({ articleId, locale });
}

export async function requirePublishedArticleContent(
  articleId: ArticleId,
  locale: Locale,
): Promise<ArticleContentEntry> {
  const indexes = await getPublishedContentIndexes();
  const entry = indexes.blog.find({ articleId, locale });

  if (entry === null) {
    throw new ContentNotFoundError(articleContext(articleId, locale));
  }

  return entry;
}
