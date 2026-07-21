import type { MarkdownHeading } from 'astro';
import type { RenderResult } from 'astro:content';

import type {
  ArticleId,
  BlogCategoryId,
  ToolCategoryId,
  ToolId,
} from '@/domain/shared/ids';
import type { ToolExecutionType } from '@/domain/tools';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import type { RouteRecord } from '@/routing/types';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';
import type { BreadcrumbModel } from '@/navigation/breadcrumbs';
import type { LocalizedRouteCluster, SeoPageModel } from '@/seo';

export interface PageDocumentModel {
  readonly locale: Locale;
  readonly route: RouteRecord | null;
  /**
   * Deprecated P05 bridge. P07 templates render document metadata through
   * SeoHead and ignore layout-owned title values.
   */
  readonly documentTitle?: string;
  readonly title: string;
  readonly description?: string;
  readonly seo?: SeoPageModel;
  readonly localizedRouteCluster?: LocalizedRouteCluster;
}

export interface RenderedContentModel {
  readonly Content: RenderResult['Content'];
  readonly headings: readonly MarkdownHeading[];
}

export interface ToolPresentationDefinition {
  readonly toolId: ToolId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly executionType: ToolExecutionType;
}

export interface HomePageModel extends PageDocumentModel {
  readonly kind: 'home';
  readonly route: null;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly messages: GlobalMessages;
}

export interface ToolPageModel extends PageDocumentModel {
  readonly kind: 'tool';
  readonly route: RouteRecord;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly toolId: ToolId;
  readonly messages: GlobalMessages;
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
  readonly presentation: ToolPresentationDefinition;
}

export interface ToolCategoryPageModel extends PageDocumentModel {
  readonly kind: 'tool-category';
  readonly route: RouteRecord;
  readonly seo: SeoPageModel;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly categoryId: ToolCategoryId;
  readonly messages: GlobalMessages;
  readonly category: {
    readonly label: string;
    readonly shortLabel?: string;
  };
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
}

export interface BlogIndexPageModel extends PageDocumentModel {
  readonly kind: 'blog-index';
  readonly categoryId?: BlogCategoryId;
}

export interface ArticlePageModel extends PageDocumentModel {
  readonly kind: 'article';
  readonly route: RouteRecord | null;
  readonly articleId: ArticleId;
}
