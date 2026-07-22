import type { RenderedContentModel } from './shared';
import type { ArticleId, BlogCategoryId } from '@/domain/shared/ids';
import type { GlobalMessages } from '@/i18n/messages/types';
import type { Locale } from '@/i18n/types';
import type { BreadcrumbModel } from '@/navigation/breadcrumbs';
import type { LanguageSwitcherModel } from '@/navigation/language-switcher';
import type { RouteRecord } from '@/routing/types';
import type { LocalizedRouteCluster, SeoPageModel } from '@/seo';

export interface ArticleDateModel {
  readonly iso: string;
  readonly display: string;
}

export interface ArticleSummaryModel {
  readonly articleId: ArticleId;
  readonly title: string;
  readonly excerpt: string;
  readonly url: string;
  readonly publishedAt: ArticleDateModel;
  readonly primaryCategory: {
    readonly categoryId: BlogCategoryId;
    readonly label: string;
  };
}

export type ArticleCategoryReferenceModel =
  | {
      readonly categoryId: BlogCategoryId;
      readonly label: string;
      readonly state: 'link';
      readonly url: string;
    }
  | {
      readonly categoryId: BlogCategoryId;
      readonly label: string;
      readonly state: 'text';
    };

export interface BlogCategorySummaryModel {
  readonly categoryId: BlogCategoryId;
  readonly label: string;
  readonly url: string;
}

export interface BlogIndexPageModel {
  readonly kind: 'blog-index';
  readonly locale: Locale;
  readonly route: null;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly title: string;
  readonly description: string;
  readonly articles: readonly ArticleSummaryModel[];
  readonly categories: readonly BlogCategorySummaryModel[];
}

export interface BlogCategoryPageModel {
  readonly kind: 'blog-category';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly categoryId: BlogCategoryId;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly content: {
    readonly title: string;
    readonly description: string;
    readonly editorial: RenderedContentModel;
  };
  readonly articles: readonly ArticleSummaryModel[];
  readonly childCategories: readonly BlogCategorySummaryModel[];
}

export interface ArticlePageModel {
  readonly kind: 'article';
  readonly locale: Locale;
  readonly route: RouteRecord;
  readonly articleId: ArticleId;
  readonly seo: SeoPageModel;
  readonly localizedRouteCluster: LocalizedRouteCluster;
  readonly languageSwitcher: LanguageSwitcherModel;
  readonly breadcrumbs: BreadcrumbModel;
  readonly messages: GlobalMessages;
  readonly content: {
    readonly title: string;
    readonly excerpt: string;
    readonly editorial: RenderedContentModel;
  };
  readonly metadata: {
    readonly publishedAt: ArticleDateModel;
    readonly updatedAt?: ArticleDateModel;
    readonly primaryCategory: ArticleCategoryReferenceModel;
  };
}
