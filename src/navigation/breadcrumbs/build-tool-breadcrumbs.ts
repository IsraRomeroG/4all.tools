import type { ToolCategoryId, ToolId } from '@/domain/shared/ids';
import type { Locale } from '@/i18n/types';
import { UnknownBreadcrumbTaxonomyNodeError } from './errors';

import {
  createBreadcrumbModel,
  createCurrentBreadcrumb,
  createHomeBreadcrumb,
  createTaxonomyBreadcrumb,
  type BreadcrumbRouteRegistry,
  type ToolTaxonomy,
} from './shared';
import type { BreadcrumbMessages, BreadcrumbModel } from './types';

export interface BuildToolBreadcrumbsInput {
  readonly locale: Locale;
  readonly toolId: ToolId;
  readonly primaryCategoryId: ToolCategoryId;
  readonly currentTitle: string;
  readonly taxonomy: ToolTaxonomy;
  readonly routeRegistry: BreadcrumbRouteRegistry;
  readonly messages: BreadcrumbMessages;
}

export function buildToolBreadcrumbs(
  input: BuildToolBreadcrumbsInput,
): BreadcrumbModel {
  if (input.taxonomy.findNode(input.primaryCategoryId) === undefined) {
    throw new UnknownBreadcrumbTaxonomyNodeError(input.primaryCategoryId);
  }

  const taxonomyPath = input.taxonomy.getPathFromRoot(input.primaryCategoryId);
  const localeInput = {
    locale: input.locale,
    messages: input.messages,
  };
  const items = [
    createHomeBreadcrumb(localeInput),
    ...taxonomyPath.map((node) =>
      createTaxonomyBreadcrumb(node, localeInput, input.routeRegistry),
    ),
    createCurrentBreadcrumb('entity', input.currentTitle),
  ];

  return createBreadcrumbModel(input.messages.breadcrumbsLabel, items);
}
