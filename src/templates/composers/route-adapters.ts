import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import { assertNever, type RouteTarget } from '@/routing/types';
import type {
  ToolCategoryPageModel,
  ToolPageModel,
} from '@/templates/models/shared';

import { UnsupportedPageTargetError } from './errors';
import {
  composeCategoryPageModel,
  type CategoryPageComposerDependencies,
} from './category';
import {
  composeToolPageModel,
  type ToolPageComposerDependencies,
} from './tool';

export interface RouteAdapterComposerDependencies {
  readonly routeRegistry: RouteRegistry;
  readonly composeCategoryPageModel?: (
    locale: Locale,
    categoryId: string,
    dependencies: CategoryPageComposerDependencies,
  ) => Promise<ToolCategoryPageModel>;
  readonly composeToolPageModel?: (
    locale: Locale,
    toolId: string,
    dependencies: ToolPageComposerDependencies,
  ) => Promise<ToolPageModel>;
}

export type ToolAreaPageModel = ToolPageModel | ToolCategoryPageModel;

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

  return (
    dependencies.composeCategoryPageModel ?? composeCategoryPageModel
  )(locale, routeTarget.categoryId, {
    routeRegistry: dependencies.routeRegistry,
  });
}

export async function composeToolAreaAdapterPage(
  locale: Locale,
  routeTarget: RouteTarget,
  dependencies: RouteAdapterComposerDependencies,
): Promise<ToolAreaPageModel> {
  switch (routeTarget.kind) {
    case 'tool':
      return (dependencies.composeToolPageModel ?? composeToolPageModel)(
        locale,
        routeTarget.toolId,
        {
          routeRegistry: dependencies.routeRegistry,
        },
      );

    case 'tool-category':
      return (
        dependencies.composeCategoryPageModel ?? composeCategoryPageModel
      )(locale, routeTarget.categoryId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'article':
    case 'blog-category':
      throw new UnsupportedPageTargetError({
        locale,
        targetKind: routeTarget.kind,
      });

    default:
      return assertNever(routeTarget);
  }
}
