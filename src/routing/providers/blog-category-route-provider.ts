import {
  listPublishedBlogCategoryContent,
  type BlogCategoryContentEntry,
} from '@/content/queries';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/types';
import type {
  BlogCategoryRouteDefinition,
  RouteDefinition,
} from '@/routing/definitions';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';

export function createBlogCategoryRouteProvider(
  listCategories: (locale: Locale) =>
    Promise<readonly BlogCategoryContentEntry[]> =
    listPublishedBlogCategoryContent,
): RouteDefinitionProvider {
  return {
    sourceId: 'blog-category-content',
    description: 'Published localized blog-category content route adapter.',
    getRouteDefinitions: async () =>
      Object.freeze(
        (
          await Promise.all(
            SUPPORTED_LOCALES.map((locale) => listCategories(locale)),
          )
        )
          .flat()
          .map(toBlogCategoryRouteDefinition),
      ),
  };
}

export const blogCategoryRouteProvider = createBlogCategoryRouteProvider();

function toBlogCategoryRouteDefinition(
  entry: BlogCategoryContentEntry,
): Extract<RouteDefinition, { readonly kind: 'blog-category' }> {
  const definition: BlogCategoryRouteDefinition = {
    categoryId: entry.data.categoryId,
    strategy: 'hierarchical',
    status: entry.data.status,
    locale: entry.data.locale,
    sourceId: entry.id,
  };

  return Object.freeze({
    kind: 'blog-category',
    definition: Object.freeze(definition),
  });
}
