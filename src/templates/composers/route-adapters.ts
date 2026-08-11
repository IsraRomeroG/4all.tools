import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import { assertNever, type RouteTarget } from '@/routing/types';
import type { StaticPageModel } from '@/templates/models/static-page';
import type { ToolCategoryPageModel, ToolPageModel } from '@/templates/models/shared';

import { UnsupportedPageTargetError } from './errors';
import {
  composeCategoryPageModel,
} from './category';
import {
  composeToolPageModel,
} from './tool';
import { composeStaticPageModel } from './static-page';

export interface RouteAdapterComposerDependencies {
  readonly routeRegistry: RouteRegistry;
}

export type ToolAreaPageModel = ToolPageModel | ToolCategoryPageModel;
export type RootAdapterPageModel = ToolCategoryPageModel | StaticPageModel;

export async function composeRootAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: RouteAdapterComposerDependencies,
): Promise<RootAdapterPageModel> {
  switch (routeTarget.kind) {
    case 'tool-category':
      return composeCategoryPageModel(locale, routeTarget.categoryId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'static-page':
      return composeStaticPageModel(locale, routeTarget.pageId, {
        routeRegistry: dependencies.routeRegistry,
      });

    default:
      throw new UnsupportedPageTargetError({
        locale,
        targetKind: routeTarget.kind,
      });
  }
}

export async function composeRootCategoryAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: RouteAdapterComposerDependencies,
): Promise<ToolCategoryPageModel> {
  if (routeTarget.kind !== 'tool-category') {
    throw new UnsupportedPageTargetError({
      locale,
      targetKind: routeTarget.kind,
    });
  }

  return composeRootAdapterPage(locale, routeTarget, dependencies) as Promise<ToolCategoryPageModel>;
}

export async function composeToolAreaAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: RouteAdapterComposerDependencies,
): Promise<ToolAreaPageModel> {
  switch (routeTarget.kind) {
    case 'tool':
      return composeToolPageModel(locale, routeTarget.toolId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'tool-category':
      return composeCategoryPageModel(locale, routeTarget.categoryId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'article':
    case 'blog-category':
    case 'static-page':
      throw new UnsupportedPageTargetError({
        locale,
        targetKind: routeTarget.kind,
      });

    default:
      return assertNever(routeTarget);
  }
}
