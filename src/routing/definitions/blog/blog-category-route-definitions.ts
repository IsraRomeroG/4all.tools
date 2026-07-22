import type { BlogCategoryRouteDefinition } from '@/routing/definitions';

export const BLOG_CATEGORY_ROUTE_DEFINITIONS = Object.freeze([
  Object.freeze({
    categoryId: 'development',
    strategy: 'hierarchical',
    status: 'published',
  }),
  Object.freeze({
    categoryId: 'json-guides',
    strategy: 'hierarchical',
    status: 'published',
  }),
] as const satisfies readonly BlogCategoryRouteDefinition[]);
