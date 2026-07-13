import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';

export const ROUTE_AREAS = ['home', 'tools', 'blog', 'static'] as const;

export type RouteArea = (typeof ROUTE_AREAS)[number];

export const ROUTE_KINDS = [
  'tool',
  'tool-category',
  'article',
  'blog-category',
] as const;

export type RouteKind = (typeof ROUTE_KINDS)[number];

export const ROUTE_STRATEGIES = ['flat', 'hierarchical'] as const;

export type RouteStrategy = (typeof ROUTE_STRATEGIES)[number];

export const TOOL_CATEGORY_ROUTE_STRATEGIES = [
  'root',
  'hierarchical',
] as const;

export type ToolCategoryRouteStrategy =
  (typeof TOOL_CATEGORY_ROUTE_STRATEGIES)[number];

export type RouteTarget =
  | {
      readonly kind: 'tool';
      readonly toolId: ToolId;
    }
  | {
      readonly kind: 'tool-category';
      readonly categoryId: ToolCategoryId;
    }
  | {
      readonly kind: 'article';
      readonly articleId: ArticleId;
    }
  | {
      readonly kind: 'blog-category';
      readonly categoryId: BlogCategoryId;
    };

export type RouteTargetKey = string;

export type LocalizedPathKey = string;

export type LocalizedTargetKey = string;

export interface RouteRecord {
  readonly area: RouteArea;
  readonly locale: Locale;
  /**
   * Full locale-relative public path segments.
   *
   * The locale prefix, leading slash, trailing slash, origin, query string,
   * hash, and Astro params are intentionally excluded.
   */
  readonly segments: readonly string[];
  readonly target: RouteTarget;
  readonly sourceId: string;
}

export function getRouteTargetKey(target: RouteTarget): RouteTargetKey {
  switch (target.kind) {
    case 'tool':
      return `tool:${target.toolId}`;

    case 'tool-category':
      return `tool-category:${target.categoryId}`;

    case 'article':
      return `article:${target.articleId}`;

    case 'blog-category':
      return `blog-category:${target.categoryId}`;

    default:
      return assertNever(target);
  }
}

export function getLocalizedPathKey(
  locale: Locale,
  segments: readonly string[],
): LocalizedPathKey {
  return `${locale}:${segments.join('/')}`;
}

export function getLocalizedTargetKey(
  locale: Locale,
  target: RouteTarget,
): LocalizedTargetKey {
  return `${locale}:${getRouteTargetKey(target)}`;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected routing variant: ${JSON.stringify(value)}.`);
}
