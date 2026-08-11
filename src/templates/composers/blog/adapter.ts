import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import { assertNever, type RouteTarget } from '@/routing/types';
import type { ArticlePageModel, BlogCategoryPageModel } from '@/templates/models/blog';

import { UnsupportedPageTargetError } from '../errors';
import {
  composeArticlePageModel,
} from './article';
import {
  composeBlogCategoryPageModel,
} from './category';

export interface BlogAreaAdapterComposerDependencies {
  readonly routeRegistry: RouteRegistry;
}

export type BlogAreaPageModel = ArticlePageModel | BlogCategoryPageModel;

export async function composeBlogAreaAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: BlogAreaAdapterComposerDependencies,
): Promise<BlogAreaPageModel> {
  switch (routeTarget.kind) {
    case 'article':
      return composeArticlePageModel(locale, routeTarget.articleId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'blog-category':
      return composeBlogCategoryPageModel(locale, routeTarget.categoryId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'tool':
    case 'tool-category':
    case 'static-page':
      throw new UnsupportedPageTargetError({
        locale,
        targetKind: routeTarget.kind,
      });

    default:
      return assertNever(routeTarget);
  }
}
