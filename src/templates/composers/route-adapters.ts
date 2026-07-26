import type { Locale } from '@/i18n/types';
import type { RouteRegistry } from '@/routing/registry';
import { assertNever, type RouteTarget } from '@/routing/types';
import type { ToolCategoryPageModel, ToolPageModel } from '@/templates/models/shared';

import { UnsupportedPageTargetError } from './errors';
import {
  composeCategoryPageModel,
} from './category';
import {
  composeToolPageModel,
} from './tool';

export interface RouteAdapterComposerDependencies {
  readonly routeRegistry: RouteRegistry;
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

  return composeCategoryPageModel(locale, routeTarget.categoryId, {
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
      return composeToolPageModel(locale, routeTarget.toolId, {
        routeRegistry: dependencies.routeRegistry,
      });

    case 'tool-category':
      return composeCategoryPageModel(locale, routeTarget.categoryId, {
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
