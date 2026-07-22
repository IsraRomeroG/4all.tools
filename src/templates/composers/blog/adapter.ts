import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import { assertNever, type RouteTarget } from '@/routing/types';
import type { ArticlePageModel, BlogCategoryPageModel } from '@/templates/models/blog';

import { UnsupportedPageTargetError } from '../errors';
import {
  composeArticlePageModel,
  type ArticlePageComposerDependencies,
} from './article';
import {
  composeBlogCategoryPageModel,
  type BlogCategoryPageComposerDependencies,
} from './category';

export interface BlogAreaAdapterComposerDependencies {
  readonly routeRegistry: RouteRegistry;
  readonly composeArticlePageModel?: (
    locale: Locale,
    articleId: string,
    dependencies: ArticlePageComposerDependencies,
  ) => Promise<ArticlePageModel>;
  readonly composeBlogCategoryPageModel?: (
    locale: Locale,
    categoryId: string,
    dependencies: BlogCategoryPageComposerDependencies,
  ) => Promise<BlogCategoryPageModel>;
}

export type BlogAreaPageModel = ArticlePageModel | BlogCategoryPageModel;

export async function composeBlogAreaAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: BlogAreaAdapterComposerDependencies,
): Promise<BlogAreaPageModel> {
  switch (routeTarget.kind) {
    case 'article':
      return (
        dependencies.composeArticlePageModel ?? composeArticlePageModel
      )(locale, routeTarget.articleId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'blog-category':
      return (
        dependencies.composeBlogCategoryPageModel ??
        composeBlogCategoryPageModel
      )(locale, routeTarget.categoryId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'tool':
    case 'tool-category':
      throw new UnsupportedPageTargetError({
        locale,
        targetKind: routeTarget.kind,
      });

    default:
      return assertNever(routeTarget);
  }
}
