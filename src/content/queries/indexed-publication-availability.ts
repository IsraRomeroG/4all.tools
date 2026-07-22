import type { Locale } from '@/i18n/types';
import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';

import type { PublishedContentIndexes } from './indexed-content-source';

export function createIndexedPublicationAvailability(
  indexes: PublishedContentIndexes,
): IndexedPublicationAvailability {
  return {
    isPublishable: (target: IndexedRouteTarget, locale: Locale) => {
      switch (target.kind) {
        case 'tool':
          return indexes.tools.find({ toolId: target.toolId, locale }) !== null;

        case 'tool-category':
          return (
            indexes.toolCategories.find({
              categoryId: target.categoryId,
              locale,
            }) !== null
          );

        case 'article':
          return (
            indexes.blog.find({ articleId: target.articleId, locale }) !== null
          );

        case 'blog-category':
          return (
            indexes.blogCategories.find({
              categoryId: target.categoryId,
              locale,
            }) !== null
          );

        default:
          return false;
      }
    },
  };
}

interface IndexedPublicationAvailability {
  isPublishable(
    target: IndexedRouteTarget,
    locale: Locale,
  ): boolean;
}

type IndexedRouteTarget =
  | { readonly kind: 'tool'; readonly toolId: ToolId }
  | { readonly kind: 'tool-category'; readonly categoryId: ToolCategoryId }
  | { readonly kind: 'article'; readonly articleId: ArticleId }
  | { readonly kind: 'blog-category'; readonly categoryId: BlogCategoryId };
