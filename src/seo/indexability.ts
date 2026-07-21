import type { PublishedContentIndexes } from '@/content/queries';
import { getPublishedContentIndexes } from '@/content/queries';
import type { Locale } from '@/i18n/types';
import { assertNever, type RouteTarget } from '@/routing/types';

export interface SeoIndexabilityResolver {
  isIndexable(target: RouteTarget, locale: Locale): boolean | Promise<boolean>;
}

export function createPublishedContentSeoIndexabilityResolver(
  indexes: PublishedContentIndexes,
): SeoIndexabilityResolver {
  return Object.freeze({
    isIndexable: (target: RouteTarget, locale: Locale): boolean => {
      switch (target.kind) {
        case 'tool': {
          const entry = indexes.tools.find({ toolId: target.toolId, locale });

          return entry !== null && !entry.data.seo.noindex;
        }

        case 'tool-category': {
          const entry = indexes.toolCategories.find({
            categoryId: target.categoryId,
            locale,
          });

          return entry !== null && !entry.data.seo.noindex;
        }

        case 'article': {
          const entry = indexes.blog.find({ articleId: target.articleId, locale });

          return entry !== null && !entry.data.seo.noindex;
        }

        case 'blog-category': {
          const entry = indexes.blogCategories.find({
            categoryId: target.categoryId,
            locale,
          });

          return entry !== null && !entry.data.seo.noindex;
        }

        default:
          return assertNever(target);
      }
    },
  });
}

export async function createDefaultSeoIndexabilityResolver(): Promise<SeoIndexabilityResolver> {
  return createPublishedContentSeoIndexabilityResolver(
    await getPublishedContentIndexes(),
  );
}
