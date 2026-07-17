import type { Locale } from '@/i18n/types';
import type { RoutePublicationAvailability } from '@/routing/registry';
import type { RouteTarget } from '@/routing/types';

import type { PublishedContentIndexes } from './indexed-content-source';

export function createIndexedPublicationAvailability(
  indexes: PublishedContentIndexes,
): RoutePublicationAvailability {
  return {
    isPublishable: (target: RouteTarget, locale: Locale) => {
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
      }
    },
  };
}
