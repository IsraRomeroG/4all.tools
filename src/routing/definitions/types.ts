import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { PublicationStatus } from '@/domain/shared/publication';
import type { Locale, PartialLocalized } from '@/i18n/types';
import type { RouteStrategy, ToolCategoryRouteStrategy } from '@/routing/types';

export interface LocalizedRouteLeaf {
  readonly slug: string;
}

export interface ToolRouteDefinition {
  readonly toolId: ToolId;
  readonly rootCategoryId: ToolCategoryId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly strategy: RouteStrategy;
  readonly localized: PartialLocalized<LocalizedRouteLeaf>;
  readonly status: PublicationStatus;
}

export interface ToolCategoryRouteDefinition {
  readonly categoryId: ToolCategoryId;
  readonly strategy: ToolCategoryRouteStrategy;
  readonly status: PublicationStatus;
  /** Temporary locale scope for one content-owned adapter entry until T04. */
  readonly locale?: Locale;
  /** Temporary content-derived adapter metadata until T04 removes definitions. */
  readonly sourceId?: string;
}

export interface ArticleRouteDefinition {
  readonly articleId: ArticleId;
  readonly primaryCategoryId: BlogCategoryId;
  readonly strategy: RouteStrategy;
  readonly localized: PartialLocalized<LocalizedRouteLeaf>;
  readonly status: PublicationStatus;
  /** Temporary content-derived adapter metadata until P15 removes providers. */
  readonly sourceId?: string;
}

export interface BlogCategoryRouteDefinition {
  readonly categoryId: BlogCategoryId;
  readonly strategy: RouteStrategy;
  readonly status: PublicationStatus;
  /** Temporary locale scope for one content-owned adapter entry until T04. */
  readonly locale?: Locale;
  /** Temporary content-derived adapter metadata until T04 removes definitions. */
  readonly sourceId?: string;
}

export type RouteDefinition =
  | {
      readonly kind: 'tool';
      readonly definition: ToolRouteDefinition;
    }
  | {
      readonly kind: 'tool-category';
      readonly definition: ToolCategoryRouteDefinition;
    }
  | {
      readonly kind: 'article';
      readonly definition: ArticleRouteDefinition;
    }
  | {
      readonly kind: 'blog-category';
      readonly definition: BlogCategoryRouteDefinition;
    };
