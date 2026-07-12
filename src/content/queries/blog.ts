import type { CollectionEntry } from 'astro:content';

import type { ArticleId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

import { getCollection } from './astro-content';
import { ContentNotFoundError, type ContentQueryContext } from './errors';
import { resolveExactMatch } from './shared';

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
  const matches = await getCollection(
    'blog',
    ({ data }) =>
      data.articleId === articleId &&
      data.locale === locale &&
      data.status === 'published',
  );

  return resolveExactMatch(matches, articleContext(articleId, locale));
}

export async function requirePublishedArticleContent(
  articleId: ArticleId,
  locale: Locale,
): Promise<ArticleContentEntry> {
  const entry = await getPublishedArticleContent(articleId, locale);

  if (entry === null) {
    throw new ContentNotFoundError(articleContext(articleId, locale));
  }

  return entry;
}
