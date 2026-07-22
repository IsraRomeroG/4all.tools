import type {
  BlogCategoryRouteDefinition,
  RouteDefinition,
} from '@/routing/definitions';
import {
  BLOG_CATEGORY_ROUTE_DEFINITIONS,
} from '@/routing/definitions/blog';
import type { RouteDefinitionProvider } from '@/routing/definitions/providers';

export function createBlogCategoryRouteProvider(
  getDefinitions: () => readonly BlogCategoryRouteDefinition[] = () =>
    BLOG_CATEGORY_ROUTE_DEFINITIONS,
): RouteDefinitionProvider {
  return {
    sourceId: 'blog-category-route-definitions',
    description: 'Explicit production blog-category route definitions.',
    getRouteDefinitions: () =>
      Object.freeze(
        getDefinitions().map((definition) =>
          Object.freeze({
            kind: 'blog-category',
            definition: Object.freeze({ ...definition }),
          } satisfies Extract<
            RouteDefinition,
            { readonly kind: 'blog-category' }
          >),
        ),
      ),
  };
}

export const blogCategoryRouteProvider = createBlogCategoryRouteProvider();
