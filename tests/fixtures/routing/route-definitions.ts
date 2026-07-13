import type {
  ArticleRouteDefinition,
  BlogCategoryRouteDefinition,
  RouteDefinition,
  ToolCategoryRouteDefinition,
  ToolRouteDefinition,
} from '@/routing/definitions/types';

export const JSON_VALIDATOR_ROUTE_FIXTURE = {
  toolId: 'json-validator',
  rootCategoryId: 'developer',
  primaryCategoryId: 'json',
  strategy: 'flat',
  localized: {
    en: { slug: 'json-validator' },
    es: { slug: 'validador-json' },
    pt: { slug: 'validador-json' },
    fr: { slug: 'validateur-json' },
  },
  status: 'published',
} as const satisfies ToolRouteDefinition;

export const DEVELOPER_CATEGORY_ROUTE_FIXTURE = {
  categoryId: 'developer',
  strategy: 'root',
  status: 'published',
} as const satisfies ToolCategoryRouteDefinition;

export const WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE = {
  articleId: 'what-is-json',
  primaryCategoryId: 'json-guides',
  strategy: 'flat',
  localized: {
    en: { slug: 'what-is-json' },
    es: { slug: 'que-es-json' },
  },
  status: 'published',
} as const satisfies ArticleRouteDefinition;

export const JSON_GUIDES_BLOG_CATEGORY_ROUTE_FIXTURE = {
  categoryId: 'json-guides',
  strategy: 'hierarchical',
  status: 'published',
} as const satisfies BlogCategoryRouteDefinition;

export const ROUTE_DEFINITION_FIXTURES = [
  {
    kind: 'tool',
    definition: JSON_VALIDATOR_ROUTE_FIXTURE,
  },
  {
    kind: 'tool-category',
    definition: DEVELOPER_CATEGORY_ROUTE_FIXTURE,
  },
  {
    kind: 'article',
    definition: WHAT_IS_JSON_ARTICLE_ROUTE_FIXTURE,
  },
  {
    kind: 'blog-category',
    definition: JSON_GUIDES_BLOG_CATEGORY_ROUTE_FIXTURE,
  },
] as const satisfies readonly RouteDefinition[];
